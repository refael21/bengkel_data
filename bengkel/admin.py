from django.contrib import admin # saya menambil ini adalah untuk menampilkan data yang sudah saya buat di models.py agar dapat diakses melalui halaman admin django
from .models import Category, Service, Booking # dan ini adalah untuk menampilkan data yang sudah saya buat

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name'] # untuk id akan diiisi otomatis oleh django dari kategori, sedangkan name akan diisi oleh user saat menambahkan data kategori baru
    search_fields = ['name']

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'estimated_duration']
    list_filter = ['category']
    search_fields = ['name']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'phone', 'car_plate', 'service', 'status', 'booking_date']
    list_filter = ['status', 'booking_date']
    search_fields = ['customer_name', 'phone', 'car_plate']
    readonly_fields = ['booking_date']