from django.urls import path, include # membuat pola URL dan memasuukan URL dari tempat lain
from rest_framework.routers import DefaultRouter # Menghasilkan URL API otomatis dari ViewSet
from .views import BookingViewSet, CategoryViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]