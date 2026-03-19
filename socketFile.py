import asyncio
import websockets
import json

clientIndex = 0
clients = set()
clientToIndex = dict()
indexToClient = dict()
clientsData = dict()
dealDamage = dict()

async def handle(ws):
    global clientIndex
    if ws not in clients:
        clients.add(ws)
        clientToIndex[ws] = clientIndex
        indexToClient[clientIndex] = ws
        clientsData[ws] = [0,0]
        dealDamage[ws] = 0
        await ws.send(json.dumps({"type": 0, "id": 0, "data": clientIndex})) # tell new client his index
        await asyncio.gather(*[
            c.send(json.dumps({"type": 0, "id": 1, "data": clientIndex})) for c in clients if c != ws # inform known clients of new player
        ],
        *[
            ws.send(json.dumps({"type": 0, "id": 2, "client": clientToIndex[c], "data": clientsData[c]})) for c in clients if c != ws # inform new clients of current players
        ])
        print([0,clientIndex])
        clientIndex += 1
    try:
        async for data in ws:
            jsonDict = json.loads(data)
            if (dealDamage[ws] != 0):
                jsonDict["health"] -= dealDamage[ws]
                if (jsonDict["health"] < 0):
                    jsonDict["health"] = 0
            clientsData.update({ws: [jsonDict["x"],jsonDict["y"],jsonDict["team"],jsonDict["rocketX"],jsonDict["rocketY"],jsonDict["angle"],jsonDict["health"]]})
            for hit in jsonDict["hits"]:
                client = indexToClient[int(hit[0])]
                dealDamage[client] += hit[1]
            if (dealDamage[ws] != 0):
                await asyncio.gather(*[
                    c.send(json.dumps({"type": 1, "client": clientToIndex[ws], "data": clientsData[ws]})) for c in clients # distribute playerdata
                ])
                dealDamage[ws] = 0
            else:
                await asyncio.gather(*[
                    c.send(json.dumps({"type": 1, "client": clientToIndex[ws], "data": clientsData[ws]})) for c in clients if c != ws # distribute playerdata
                ])
            print(ws, clientsData[ws])
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await asyncio.gather(*[
            c.send(json.dumps({"type": 0, "id": 3, "data": clientToIndex[ws]})) for c in clients if c != ws # inform known clients of leaving player
        ])
        clients.remove(ws)

async def main():
    async with websockets.serve(handle, "localhost", 6789):
        print("Server running at ws://localhost:6789")
        await asyncio.Future()  # Run forever

if __name__ == '__main__':
    asyncio.run(main())
