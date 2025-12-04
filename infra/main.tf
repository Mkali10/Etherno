provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  
  name = "etheron-vpc"
  cidr = var.vpc_cidr
  
  azs             = var.availability_zones
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true
}

# ECS Cluster
resource "aws_ecs_cluster" "etheron" {
  name = "etheron-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECR Repository
resource "aws_ecr_repository" "etheron_broker" {
  name                 = "etheron-broker"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

# Task Definition (Fargate)
resource "aws_ecs_task_definition" "etheron_broker" {
  family                   = "etheron-broker-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  
  container_definitions = jsonencode([{
    name  = "etheron-broker"
    image = "${aws_ecr_repository.etheron_broker.repository_url}:latest"
    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]
    environment = [
      { name = "DB_HOST", value = aws_db_instance.etheron.endpoint },
      { name = "DB_NAME", value = "etheron" },
      { name = "DB_USER", value = var.db_username },
      { name = "DB_PASS", value = var.db_password }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.etheron.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "etheron"
      }
    }
  }])
}

# ECS Service (Zero Downtime Rolling Updates)
resource "aws_ecs_service" "etheron_broker" {
  name            = "etheron-broker-service"
  cluster         = aws_ecs_cluster.etheron.id
  task_definition = aws_ecs_task_definition.etheron_broker.arn
  launch_type     = "FARGATE"
  
  desired_count                      = 2
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  
  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.etheron.arn
    container_name   = "etheron-broker"
    container_port   = 8080
  }
  
  depends_on = [aws_lb_listener.front_end]
}

# Application Load Balancer
resource "aws_lb" "etheron" {
  name               = "etheron-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
}

# Output Load Balancer DNS
output "website_url" {
  value = aws_lb.etheron.dns_name
}
