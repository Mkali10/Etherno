provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  
  name = "remote-access-vpc"
  cidr = var.vpc_cidr
  
  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "remote-access-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Service (Zero Downtime Rolling Updates)
resource "aws_ecs_service" "broker" {
  name            = "broker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.broker.arn
  desired_count   = 2
  
  deployment_controller {
    type = "ECS"
  }
  
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100
  
  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "broker"
    container_port   = 8080
  }
  
  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
  }
}
