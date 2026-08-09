from fastapi import HTTPException


class CrawlException(HTTPException):

    def __init__(self, message):

        super().__init__(

            status_code=500,

            detail=message

        )


class ChatException(HTTPException):

    def __init__(self, message):

        super().__init__(

            status_code=500,

            detail=message

        )