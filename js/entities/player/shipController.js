// ------------------------
// file: js/entities/player/shipController.js
// ------------------------

const ShipController = {
    cargo: 0,
    addCargo(amount = 1) { // Add cargo.
        this.cargo = Math.max(0, this.cargo + amount);
        return this.cargo;
    },
    resetCargo() { // Reset cargo.
        this.cargo = 0;
    }
};

window.ShipController = ShipController;
