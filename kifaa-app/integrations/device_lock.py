"""Device lock simulation for financed assets."""

class DeviceLock:
    def __init__(self, device_id: str) -> None:
        self.device_id = device_id
        self.locked = False

    def lock(self) -> None:
        self.locked = True
        print(f"Device {self.device_id} is now locked.")

    def unlock(self) -> None:
        self.locked = False
        print(f"Device {self.device_id} is now unlocked.")
