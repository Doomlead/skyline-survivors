// ------------------------
// file: js/entities/player/shipController.js
// ------------------------

const ShipController = {
    cargo: 0,
    // Adds rescued cargo count and returns the updated cargo total.
    addCargo(amount = 1) {
        this.cargo = Math.max(0, this.cargo + amount);
        return this.cargo;
    },
    // Clears all carried cargo after drop-off or reset events.
    resetCargo() {
        this.cargo = 0;
    }
};

window.ShipController = ShipController;
