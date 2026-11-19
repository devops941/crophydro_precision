import csv
from pathlib import Path
from django.core.management.base import BaseCommand
from calculator.models import Crop, IrrigationMethod

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"

CROP_NAMES = {
    "rice": "Rice",
    "maize": "Maize",
    "millet": "Pearl Millet",
}

METHOD_NAMES = {
    "drip": "Drip",
    "sprinkler": "Sprinkler",
    "surface": "Surface (flood)",
}


class Command(BaseCommand):
    help = "Import crops and irrigation methods from CSV files in backend/data/"

    def handle(self, *args, **options):
        self._import_crops()
        self._import_methods()

    def _import_crops(self):
        path = DATA_DIR / "crop_kc.csv"
        self.stdout.write(f"Importing crops from {path}")
        errors = 0
        imported = 0

        with open(path, encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                code = row["crop"].strip()
                try:
                    obj, created = Crop.objects.update_or_create(
                        code=code,
                        defaults={
                            "name_en": CROP_NAMES.get(code, code.title()),
                            "name_ta": row["crop_tamil"].strip(),
                            "kc_ini": float(row["kc_ini"]),
                            "kc_mid": float(row["kc_mid"]),
                            "kc_end": float(row["kc_end"]),
                            "days_initial": int(row["days_initial"]),
                            "days_dev": int(row["days_dev"]),
                            "days_mid": int(row["days_mid"]),
                            "days_late": int(row["days_late"]),
                            "total_days": int(row["total_days"]),
                            "is_active": True,
                        },
                    )
                    obj.full_clean()
                    obj.save()
                    action = "Created" if created else "Updated"
                    self.stdout.write(self.style.SUCCESS(f"  {action}: {obj}"))
                    imported += 1
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"  Error on row {row}: {e}"))
                    errors += 1

        self.stdout.write(f"Crops: {imported} imported, {errors} errors.")

    def _import_methods(self):
        path = DATA_DIR / "irrigation_methods.csv"
        self.stdout.write(f"Importing irrigation methods from {path}")
        errors = 0
        imported = 0

        with open(path, encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                code = row["method"].strip()
                try:
                    obj, created = IrrigationMethod.objects.update_or_create(
                        code=code,
                        defaults={
                            "name_en": METHOD_NAMES.get(code, code.title()),
                            "name_ta": row["method_tamil"].strip(),
                            "efficiency": float(row["efficiency"]),
                            "is_active": True,
                        },
                    )
                    obj.full_clean()
                    obj.save()
                    action = "Created" if created else "Updated"
                    self.stdout.write(self.style.SUCCESS(f"  {action}: {obj}"))
                    imported += 1
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"  Error on row {row}: {e}"))
                    errors += 1

        self.stdout.write(f"Methods: {imported} imported, {errors} errors.")
