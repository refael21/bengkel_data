from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Category, Service, Booking
from .serializers import CategorySerializer, ServiceSerializer, BookingSerializer

class CategoryViewSet(viewsets.ModelViewSet): # ini dilakukan untuk menampilkan data, membuat, mengubah, melihat serta menghapus data yang dada dalam tabel category yang sudah dibuat dalam file models.py
    queryset = Category.objects.all() # Menenentukan data yang akan diambil oleh API semua data dari model Category yang sudah dibuat dalam file models.py
    serializer_class = CategorySerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.select_related('category').all()
    serializer_class = ServiceSerializer

    def get_queryset(self): # untuk membuat method dan function pada viewset untuk menentukan data mana yang akan diambil dari dalam database dala object data tabel Service
        queryset= super().get_queryset() # Function untuk memanggil class induknya, dalam hal ini adalah class ServiceViewSet, dan memanggil method get_queryset() dari class induk (ModelViewSet) untuk mendapatkan queryset default dari model Service.
        category_id = self.request.query_params.get('category') #mengambil nilai kategori dari permintaan URL Request. Jika ada parameter kategori dalam URL, maka nilai tersebut akan disimpan dalam variabel category_id. Jika tidak ada, maka category_id akan bernilai None.
        if category_id:
            queryset = queryset.filter(category_id=category_id) # memfilter kategori berdasarkan request dari permintaan URL dan HTTP Request. Jika ada parameter kategori dalam URL, maka queryset akan difilter untuk hanya menyertakan layanan yang memiliki kategori_id yang sesuai dengan nilai category_id yang diterima dari permintaan URL.
        return queryset # hasil akhir dari seluruh service, jika tidak ada filter, atau service kategory tertentu jika ada atau terdapat parameter yang diminta
    # kode definisi diatas saya saya berikan untuk dapat membuat kategori filter pada API Service. 
    # Artinya API dapat menampilkan semua service atau hanya service tertentu saja, berdasarkan paramter URL saja
    # Dan mengubah get_queryset() yang dimana adalah menurut saya cara yang paling umum dalam framework Django REST 
    # guna untuk menyesuaikan data yang akan dikembalikan oleh vieweset

class BookingViewSet(viewsets.ModelViewSet): # Membuat  class bawaan dari django REST API Framework yang sudah menyediakan 5 endpoint Method API secara otomatis
    queryset = Booking.objects.select_related('service', 'service__category').all()
    serializer_class = BookingSerializer
    # select_related guna untuk mengambil data service dan booking nya. Dan untuk service__category adalah untuk mengambil data dari category yang berelasi dengan service
    # dan untuk all(), yang artinya nya mengambil semua data booking dari data database
    # dan untuk serializer saya gunakan untuk mengubah data dari database ke dalam JSON untuk ditampilkan ke dalam frontend

    def perform_create(self, serializer):
        # disini akan otomatis ber status pending
        serializer.save(status='pending')
        # def membuat method
        # perform_create adalag method khusus pada ModelViewSet untuk mengatur proses penyimpanan data baru
        # serializer adalah objek yang sudah menerima dan memvalidadi data dari REQUEST API
        # dan untuk seld mengacu pada BookingViewSet yang sedang menangani request, yang dimana akan mengirimkan ke dalam bentuk JSON untuk ditampikan ke FE
        # dan untuk serializer.save() saya gunakan untuk menyimpan data booking baru ke database.

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        # @action adalah yang saya gunakan sebagai decorator django untuk REST Framework guna membuat endpoint tambahan
        # detail=True endpoint bekerja untuk satu booking tertentu saja, berdasarkan ID Booking
        # methods['patch'] endpoint hanya menerima HTTP method PATCH yaitu update
        # PATCH saya gunakan karena hanya memperbarui sebagian data yaitu field status
        # def membuat method/function
        #update_status akan menjadi nama endpoint tambahan
        # self akan mengacu pada Booking
        # request yaitu untuk berisi data request dari frontend, termasuk data JSON yang dikirim
        # pk yang dimana adalah primary key, yaitu ID Booking dari URL
        # booking = self.get_object() yaitu mengambil satu data booking berdasarkan pk pada URL. jika
        # booking ID tersebut tidak ada, maka framework dari Django REST Framework akan memberi respon 400 not found;
        # dan ini juga membantu menerapkan pengecekan permission yang berlaku.

        if new_status not in dict(Booking.STATUS_CHOICE):
            return Response(
                {'error':'Status tidak valid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = new_status
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    # Penjelasan fungsi syntax:
    # 1. Memeriksa apakah status valid
    # 2. jika tidak valid, API mengembalikan pesan error.
    # 3. jika valid, status booking diperbarui di database
    # 4. API mengirim kembali data booking yang sudah diperbarui.