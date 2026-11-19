from django.urls import path
from . import views

urlpatterns = [
    path("crops/", views.crops_list, name="crops-list"),
    path("methods/", views.methods_list, name="methods-list"),
    path("calculate/", views.calculate_view, name="calculate"),
    path("history/", views.history_list, name="history-list"),
    path("history/summary/", views.history_summary, name="history-summary"),
    path("history/<int:pk>/", views.history_detail, name="history-detail"),
]
