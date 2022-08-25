"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerVisibility = void 0;
var PlayerVisibility;
(function (PlayerVisibility) {
    PlayerVisibility[PlayerVisibility["ONLINE"] = 0] = "ONLINE";
    PlayerVisibility[PlayerVisibility["APPEAR_OFFLINE"] = 1] = "APPEAR_OFFLINE";
    PlayerVisibility[PlayerVisibility["HIDDEN"] = 2] = "HIDDEN";
    PlayerVisibility[PlayerVisibility["DND"] = 3] = "DND";
})(PlayerVisibility = exports.PlayerVisibility || (exports.PlayerVisibility = {}));
