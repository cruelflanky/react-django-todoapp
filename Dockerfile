FROM python:3.9

ENV PYTHONUNBUFFERED 1

WORKDIR /todo_app

COPY requirements.txt /todo_app/

RUN pip install -r requirements.txt

COPY . /todo_app/

RUN useradd user

USER user