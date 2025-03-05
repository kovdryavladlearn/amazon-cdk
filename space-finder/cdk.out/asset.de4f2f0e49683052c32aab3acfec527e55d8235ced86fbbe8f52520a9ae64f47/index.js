var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/services/spaces/handler.ts
var handler_exports = {};
__export(handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_exports);
var import_client_dynamodb5 = require("@aws-sdk/client-dynamodb");

// src/services/spaces/PostSpaces.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");

// node_modules/uuid/dist/esm/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm/rng.js
var import_crypto = require("crypto");
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// node_modules/uuid/dist/esm/native.js
var import_crypto2 = require("crypto");
var native_default = { randomUUID: import_crypto2.randomUUID };

// node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/services/Shared/DataValidator.ts
var MissingFieldError = class extends Error {
  constructor(missingField) {
    super(`Value for ${missingField} expected!`);
  }
};
function validateAsSpaceEntry(arg) {
  if (arg.location == void 0) {
    throw new MissingFieldError("location");
  }
  if (arg.name == void 0) {
    throw new MissingFieldError("name");
  }
  if (arg.id == void 0) {
    throw new MissingFieldError("id");
  }
}

// src/services/spaces/PostSpaces.ts
var import_util_dynamodb = require("@aws-sdk/util-dynamodb");
async function postSpaces(event, ddClient2) {
  const randomId = v4_default();
  const item = JSON.parse(event.body);
  item.id = randomId;
  validateAsSpaceEntry(item);
  const result = await ddClient2.send(new import_client_dynamodb.PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: (0, import_util_dynamodb.marshall)(item)
  }));
  console.log(result);
  return {
    statusCode: 201,
    body: JSON.stringify({ id: randomId })
  };
}

// src/services/spaces/GetSpaces.ts
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var import_util_dynamodb2 = require("@aws-sdk/util-dynamodb");
async function getSpaces(event, ddClient2) {
  if (event.queryStringParameters) {
    if ("id" in event.queryStringParameters) {
      const spaceId = event.queryStringParameters["id"];
      const getItemResponse = await ddClient2.send(new import_client_dynamodb2.GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          "id": {
            S: spaceId
          }
        }
      }));
      if (getItemResponse.Item) {
        const unmarshalledItem = (0, import_util_dynamodb2.unmarshall)(getItemResponse.Item);
        return {
          statusCode: 200,
          body: JSON.stringify(unmarshalledItem)
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify(`Space with id ${spaceId} not found!`)
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify("Id required!")
      };
    }
  }
  const result = await ddClient2.send(new import_client_dynamodb2.ScanCommand({
    TableName: process.env.TABLE_NAME
  }));
  const unmarshalledItems = result.Items?.map((item) => (0, import_util_dynamodb2.unmarshall)(item));
  console.log(unmarshalledItems);
  return {
    statusCode: 200,
    body: JSON.stringify(unmarshalledItems)
  };
}

// src/services/spaces/UpdateSpace.ts
var import_client_dynamodb3 = require("@aws-sdk/client-dynamodb");
async function updateSpace(event, ddClient2) {
  if (event.queryStringParameters && "id" in event.queryStringParameters && event.body) {
    const spaceId = event.queryStringParameters["id"];
    const parsedBody = JSON.parse(event.body);
    const requestBodyKey = Object.keys(parsedBody)[0];
    const requestBodyValue = parsedBody[requestBodyKey];
    const updateResult = await ddClient2.send(new import_client_dynamodb3.UpdateItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        "id": {
          S: spaceId
        }
      },
      UpdateExpression: "set #zzzNew = :new",
      ExpressionAttributeValues: {
        ":new": {
          S: requestBodyValue
        }
      },
      ExpressionAttributeNames: {
        "#zzzNew": requestBodyKey
      },
      ReturnValues: "UPDATED_NEW"
    }));
    return {
      statusCode: 204,
      body: JSON.stringify(updateResult.Attributes)
    };
  }
  return {
    statusCode: 400,
    body: JSON.stringify("Please, provide right args!!")
  };
}

// src/services/spaces/DeleteSpace.ts
var import_client_dynamodb4 = require("@aws-sdk/client-dynamodb");
async function deleteSpace(event, ddClient2) {
  if (event.queryStringParameters && "id" in event.queryStringParameters) {
    const spaceId = event.queryStringParameters["id"];
    const deleteResult = await ddClient2.send(new import_client_dynamodb4.DeleteItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        "id": {
          S: spaceId
        }
      }
    }));
    return {
      statusCode: 200,
      body: JSON.stringify(`Deleted space with id ${spaceId}`)
    };
  }
  return {
    statusCode: 400,
    body: JSON.stringify("Please, provide right args!!")
  };
}

// src/services/spaces/handler.ts
var ddClient = new import_client_dynamodb5.DynamoDBClient({});
async function handler(event, context) {
  let message;
  try {
    switch (event.httpMethod) {
      case "GET":
        const getResponse = await getSpaces(event, ddClient);
        return getResponse;
      case "POST":
        const postResponse = await postSpaces(event, ddClient);
        return postResponse;
      case "PUT":
        const putResponse = await updateSpace(event, ddClient);
        return putResponse;
      case "DELETE":
        const deleteResponse = await deleteSpace(event, ddClient);
        return deleteResponse;
      default:
        break;
    }
  } catch (error) {
    if (error instanceof MissingFieldError) {
      return {
        statusCode: 400,
        body: JSON.stringify(error.message)
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify(error.message)
    };
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify(message)
  };
  console.log(event);
  return response;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
