from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_message = "An error occurred."
        details = {}

        if isinstance(response.data, dict):
            if "detail" in response.data:
                error_message = str(response.data["detail"])
            elif "non_field_errors" in response.data:
                error_message = " ".join(str(e) for e in response.data["non_field_errors"])
                del response.data["non_field_errors"]
                details = {k: [str(e) for e in v] if isinstance(v, list) else [str(v)]
                           for k, v in response.data.items()}
            else:
                field_errors = {
                    k: [str(e) for e in v] if isinstance(v, list) else [str(v)]
                    for k, v in response.data.items()
                    if k != "detail"
                }
                if field_errors:
                    error_message = "Validation failed."
                    details = field_errors

        response.data = {"error": error_message}
        if details:
            response.data["details"] = details

    return response
