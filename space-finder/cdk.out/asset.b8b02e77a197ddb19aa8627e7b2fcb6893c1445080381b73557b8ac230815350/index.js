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

// src/services/Shared/DataValidator.ts
var MissingFieldError = class extends Error {
  constructor(missingField) {
    super(`Value for ${missingField} expected!`);
  }
};
var JsonError = class extends Error {
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

// src/services/Shared/Utils.ts
var import_crypto = require("crypto");
function createRandomId() {
  return (0, import_crypto.randomUUID)();
}
function addCorsHeader(arg) {
  if (!arg.headers) {
    arg.headers = {};
  }
  arg.headers["Access-Control-Allow-Origin"] = "*";
  arg.headers["Access-Control-Allow-Methods"] = "*";
}
function parseJSON(arg) {
  try {
    return JSON.parse(arg);
  } catch (error) {
    throw new JsonError(error.message);
  }
}
function hasAdminGroup(event) {
  const groups = event.requestContext.authorizer.claims["cognito:groups"];
  if (groups) {
    return groups.includes("admins");
  }
  return false;
}

// src/services/spaces/PostSpaces.ts
async function postSpaces(event, ddClient2) {
  const randomId = createRandomId();
  const item = parseJSON(event.body);
  item.id = randomId;
  validateAsSpaceEntry(item);
  const result = await ddClient2.send(new import_client_dynamodb.PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: (0, import_util_dynamodb.marshall)(item)
  }));
  console.log(result);
  return {
    statusCode: 200,
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
  if (!hasAdminGroup(event)) {
    return {
      statusCode: 401,
      body: JSON.stringify("Not authorized")
    };
  }
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
  let response;
  try {
    switch (event.httpMethod) {
      case "GET":
        response = await getSpaces(event, ddClient);
      case "POST":
        response = await postSpaces(event, ddClient);
      case "PUT":
        response = await updateSpace(event, ddClient);
      case "DELETE":
        response = await deleteSpace(event, ddClient);
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
    if (error instanceof JsonError) {
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
  response = {
    statusCode: 200,
    body: JSON.stringify(message)
  };
  addCorsHeader(response);
  return response;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
