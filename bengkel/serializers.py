
from rest_framework import serializers # Menyediakan serializer untuk model Django
from .models import Category, Service, Booking # Saya ambil dari file bengkel/models.py, karena saya ingin mengubah data model menjadi format JSON dan sebaliknya.

class CategorySerializer(serializers.ModelSerializer): # membuat class baru dan seliezers nya yang dimana khusus untuk tabel data Category yang sudah dibuat dalam file models.py
    class Meta: # untuk memberikan informasi tambahan tentang model yang akan diserialisasi, seperti field apa yang dipakai atau variabel apa yang akan masuk ke dalam API
        model = Category
        fields = ['id', 'name']

class ServiceSerializer(serializers.ModelSerializer):
    category_name =serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'name', 'category', 'category_name', 'estimated_duration', 'price']

class BookingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    category_name = serializers.CharField(source='service.category.name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer_name', 'phone', 'car_model', 'car_plate', 
            'service', 'service_name', 'category_name', 
            'status', 'booking_date'
        ]
        read_only_fields = ['booking_date', 'status'] # ini yang dipakai status default