from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
        UserSerializer,
        UserSerializerWithToken,
        TaskSerializer
    )
from .models import Task
from django.utils import dateparse

#Basic api overview

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'Check auth':'backend/current_user/',
        'Add user':'backend/users/',
        'Task List':'backend/task-list/',
        'Detail View':'backend/task-detail/<str:pk>/',
        'Create task':'backend/task-create/',
        'Update task':'backend/task-update/<str:pk>/',
        'Delete task':'backend/task-delete/<str:pk>/',
        }

    return Response(api_urls)

#Determine the current user by their token, and return their data

@api_view(['GET'])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)



#Create a new user

class UserList(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#taskList response back all tasks filtered by User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def taskList(request):
    tasks = Task.objects.filter(user=request.user).order_by('-id')
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

#Detail overview for every task

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def taskDetail(request, pk):
    tasks = Task.objects.get(id=pk)
    serializer = TaskSerializer(tasks, many=False)
    return Response(serializer.data)

#Creating new task and parsing tome for date_finished field

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def taskCreate(request):
    request.data['date_finished'] = dateparse.parse_datetime(request.data['date_finished'])
    serializer = TaskSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

#Update task by its key

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def taskUpdate(request, pk):
    task = Task.objects.get(id=pk)
    serializer = TaskSerializer(instance=task, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

#Delete task by its key

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def taskDelete(request, pk):
    task = Task.objects.get(id=pk)
    task.delete()

    return Response('Item succsesfully delete!')
