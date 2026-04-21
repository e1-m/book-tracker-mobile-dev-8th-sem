import asyncio
import json
import random
import logging
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

MOCK_MESSAGES = [
    'Anna started reading "Dune"',
    'Mark added "1984" to wishlist',
    'Kate finished "The Hobbit"',
    'Leo started reading "Harry Potter"',
    'Sophie added "The Alchemist" to wishlist',
]


@app.websocket("/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected!")

    try:
        while True:
            notification = {
                "id": str(uuid.uuid4()),
                "message": random.choice(MOCK_MESSAGES),
                "createdAt": datetime.now(timezone.utc).isoformat()
            }

            await websocket.send_text(json.dumps(notification))
            logger.info(f"Sent: {notification['message']}")

            await asyncio.sleep(4)

    except WebSocketDisconnect:
        logger.info("Client disconnected.")
