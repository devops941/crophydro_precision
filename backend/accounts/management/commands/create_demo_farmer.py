"""
Command to seed or reset the default demo farmer account.
Usage:
    python manage.py create_demo_farmer
"""

from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = "Creates or resets the demo farmer account (arun@example.com / Farmer@2026)"

    def handle(self, *args, **options):
        email = "arun@example.com"
        password = "Farmer@2026"
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"full_name": "Arun Kumar"},
        )
        user.set_password(password)
        user.is_active = True
        user.save()

        action = "Created" if created else "Updated password for"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} demo user '{email}' with password '{password}'."
            )
        )
