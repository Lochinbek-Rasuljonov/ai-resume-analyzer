from django.urls import path
from .views import AnalysisResultDetailView

urlpatterns = [
    path('<int:resume_id>/', AnalysisResultDetailView.as_view(), name='analysis-detail'),
]
