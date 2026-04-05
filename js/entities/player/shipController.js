// ------------------------
// file: js/entities/player/shipController.js
// ------------------------

const ShipController = {
    cargo: 0,
    liberatedCargo: 0,
    // Adds rescued cargo count and returns the updated cargo total.
    addCargo(amount = 1, options = {}) {
        this.cargo = Math.max(0, this.cargo + amount);
        if (options?.liberated) {
            this.liberatedCargo = Math.max(0, this.liberatedCargo + amount);
        }
        return this.cargo;
    },
    // Returns and clears liberated cargo count after resolving drop-off effects.
    consumeLiberatedCargo() {
        const liberated = this.liberatedCargo || 0;
        this.liberatedCargo = 0;
        return liberated;
    },
    // Clears all carried cargo after drop-off or reset events.
    resetCargo() {
        this.cargo = 0;
        this.liberatedCargo = 0;
    }
};

window.ShipController = ShipController;
