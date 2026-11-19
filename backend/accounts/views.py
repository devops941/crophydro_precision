from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer


class LoginRateThrottle(AnonRateThrottle):
    rate = "10/min"
    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    rate = "10/min"
    scope = "register"


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([RegisterRateThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Validation failed.", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    email = serializer.validated_data["email"]
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "An account with this email already exists."},
            status=status.HTTP_409_CONFLICT,
        )
    user = serializer.save()
    access, refresh = _tokens_for_user(user)
    return Response(
        {"user": UserSerializer(user).data, "access": access, "refresh": refresh},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Invalid credentials.", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user = serializer.validated_data["user"]
    access, refresh = _tokens_for_user(user)
    return Response({"user": UserSerializer(user).data, "access": access, "refresh": refresh})


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token_str = request.data.get("refresh")
    if not refresh_token_str:
        return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        refresh = RefreshToken(refresh_token_str)
        access = str(refresh.access_token)
        return Response({"access": access, "refresh": str(refresh)})
    except TokenError as e:
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token_str = request.data.get("refresh")
    if not refresh_token_str:
        return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token_str)
        token.blacklist()
        return Response({"ok": True})
    except TokenError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "GET":
        return Response({"user": UserSerializer(request.user).data})
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(
            {"error": "Validation failed.", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer.save()
    return Response({"user": serializer.data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Validation failed.", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not request.user.check_password(serializer.validated_data["old_password"]):
        return Response(
            {"error": "Validation failed.", "details": {"old_password": ["Current password is incorrect."]}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save()
    return Response({"ok": True})
