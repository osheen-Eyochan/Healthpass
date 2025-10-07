from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
import jwt

from doctor.models import Doctor, MedicineMaster
from receptionist.models import Patient, Appointment
from .serializers import DoctorSerializer, PatientSerializer, AppointmentSerializer, MedicineSerializer

# -----------------------------
# Admin Login
# -----------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user and user.is_staff:
        token = jwt.encode({'username': user.username}, settings.SECRET_KEY, algorithm='HS256')
        return Response({
            "success": True,
            "token": token,
            "username": user.username,
            "email": user.email,
        }, status=status.HTTP_200_OK)
    return Response({"success": False, "message": "Invalid credentials or not an admin"}, status=status.HTTP_401_UNAUTHORIZED)


# -----------------------------
# Admin Dashboard stats
# -----------------------------
@api_view(['GET'])
@permission_classes([AllowAny])  # Change to IsAdminUser for production
def dashboard(request):
    return Response({
        "success": True,
        "doctors_count": Doctor.objects.count(),
        "patients_count": Patient.objects.count(),
        "appointments_count": Appointment.objects.count(),
        "medicines_count": MedicineMaster.objects.count()
    }, status=status.HTTP_200_OK)


# -----------------------------
# Doctor CRUD
# -----------------------------
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def doctor_list_create(request):
    if request.method == 'GET':
        doctors = Doctor.objects.all()
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)

    serializer = DoctorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def doctor_detail(request, doctor_id):
    doctor = get_object_or_404(Doctor, id=doctor_id)

    if request.method == 'GET':
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = DoctorSerializer(doctor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        doctor.delete()
        return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)


# -----------------------------
# Patient CRUD
# -----------------------------
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def patient_list_create(request):
    if request.method == 'GET':
        patients = Patient.objects.all()
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

    serializer = PatientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def patient_detail(request, patient_id):
    patient = get_object_or_404(Patient, id=patient_id)

    if request.method == 'GET':
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = PatientSerializer(patient, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        patient.delete()
        return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)


# -----------------------------
# Appointment List
# -----------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def appointment_list(request):
    appointments = Appointment.objects.all()
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------------
# Medicine CRUD
# -----------------------------
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def medicine_list_create(request):
    if request.method == 'GET':
        medicines = MedicineMaster.objects.all()
        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)

    serializer = MedicineSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
