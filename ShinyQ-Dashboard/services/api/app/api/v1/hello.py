from fastapi import APIRouter, Depends, Request

from app.services.hello_service import HelloService, get_hello_service

router = APIRouter()


@router.get("/hello")
def hello(
    request: Request,
    service: HelloService = Depends(get_hello_service),
):
    return service.get_greeting(request.state.request_id)
