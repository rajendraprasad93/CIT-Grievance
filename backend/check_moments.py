import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['test_database']
    moments = await db.moments.find({}, {'_id': 0, 'moment_id': 1, 'title': 1}).to_list(10)
    print('Moments in DB:')
    for m in moments:
        print(f"  {m['moment_id']}: {m['title']}")

asyncio.run(check())
