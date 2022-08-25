"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionState = void 0;
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["DISCONNECTED"] = 0] = "DISCONNECTED";
    ConnectionState[ConnectionState["CONNECTING"] = 1] = "CONNECTING";
    ConnectionState[ConnectionState["CONNECTED"] = 2] = "CONNECTED";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
