from django.urls import path
from . import views

urlpatterns = [
    path('token/<str:token_id>/', views.get_token_details, name='get_token_details'),
]
