# Driver Cleanup Script — Full Reasoning

## Source Data Analysis

The ducky report revealed a Windows 11 system with **308 PlugAndPlay devices**, many showing duplicate or ghost entries. Key findings:

### Device Classes with Issues

| Class | Count | Issue |
|-------|-------|-------|
| HIDClass (Keyboard/Mouse) | Multiple | Duplicate VID/PID entries |
| USB | Multiple | Ghost devices in registry |
| Audio | Several | Multiple driver versions |
| USBHub | Multiple | Generic hub duplicates |

### Specific VID/PIDs of Concern

| Vendor | VID | Products | Issue |
|--------|-----|----------|-------|
| Razer | 1532 | Keyboard + Mouse | Multiple HID entries |
| Corsair | 1B1C | Lighting devices | iCUE software remnants |
| HP | 03F0 | Audio + Input | Multiple device instances |
| Unknown | 3233 | HID device | Unidentified driver |

## Script Architecture Reasoning

### 1. System Restore Point (Safety First)

**Why:** Registry modifications can break Windows boot.
**Implementation:** `Checkpoint-Computer` before any changes.
**Fallback:** `-Force` flag allows bypass if restore fails (for automation).

### 2. State Export (Audit Trail)

**Why:** Need before/after comparison for troubleshooting.
**Implementation:** Export all PnP devices to CSV with InstanceId, Status, Class.
**Storage:** `$env:TEMP\Devices_Before_Cleanup_*.csv`

### 3. Ghost Device Detection

**Logic:**
```powershell
# Device in registry HKLM:<>SYSTEM<>CurrentControlSet<>Enum<>USB
# BUT
# Not in Get-PnpDevice with Status = "OK"
```

**Why this matters:** Windows accumulates USB device entries over time. Each time you plug in a USB device, it creates a registry entry. Even if you never plug it in again, the entry remains. After years, this creates hundreds of stale entries.

**Target:** `HKLM:\SYSTEM\CurrentControlSet\Enum\USB` subkeys not currently active.

### 4. Duplicate HID Detection

**Logic:**
```powershell
# Group devices by VID_xxxx&PID_yyyy pattern
# If count > 1 per group = duplicates
```

**Why this matters:** HID devices (keyboards, mice) often create multiple entries:
- USB interface
- HID interface  
- Composite device
- Consumer control (media keys)

After driver updates or device reconnections, these multiply. The script identifies groups with excessive entries.

### 5. DriverStore Analysis

**Why:** Windows keeps all driver versions in `C:\Windows\System32\DriverStore\FileRepository`. Old versions accumulate but aren't automatically removed.

**Conservative approach:** Script only *lists* packages. Actual removal requires:
```powershell
pnputil /delete-driver oemXX.inf /uninstall /force
```

**Why conservative:** Removing wrong driver package can break devices. Manual review recommended.

### 6. Registry Cleanup Strategy

**Ghost USB Removal:**
- Targets `HKLM:\SYSTEM\CurrentControlSet\Enum\USB` only
- Verifies device not currently connected
- Removes entire device subtree

**HID Optimization:**
- Targets duplicate entries in `HKLM:\SYSTEM\CurrentControlSet\Enum\HID`
- Sorts by DriverDate (keeps newest)
- Removes older instances

### 7. Cache Clearing

**Files:**
- `C:\Windows\inf\setupapi.dev.log` (device installation log)
- `C:\Windows\inf\setupapi.offline.log`

**Why:** These logs grow indefinitely. Clearing doesn't affect functionality.

## Safety Mechanisms

| Mechanism | Purpose |
|-----------|---------|
| System Restore Point | Rollback if system breaks |
| CSV Export | Audit trail of what was present |
| `-WhatIf` flag | Preview mode, no actual changes |
| Error handling | Continues on individual failures |
| Admin elevation | `#Requires -RunAsAdministrator` |

## What the Script Does NOT Do

**Intentionally excluded (too risky):**

1. **Active driver removal** — Only removes ghost devices, not currently working ones
2. **PnPUtil /delete-driver** — Lists but doesn't auto-delete DriverStore packages
3. **Force driver update** — Doesn't install new drivers
4. **Service removal** — Leaves Corsair/Logitech services alone

## Post-Cleanup Recommendations

### Immediate
1. Restart Windows (reloads driver stack)
2. Check Device Manager for yellow triangles
3. Verify keyboard/mouse functionality

### Short-term
1. Update drivers from manufacturer:
   - Razer Synapse
   - Corsair iCUE
   - HP Support Assistant

2. Run `sfc /scannow` to verify system integrity

### Verification Commands
```powershell
# Check for remaining ghost devices
Get-PnpDevice | Where-Object { $_.Status -eq "Unknown" }

# List driver versions
Get-PnpDevice | Select-Object Name, DriverVersion | Sort-Object Name

# Check DriverStore size
(Get-ChildItem C:\Windows\System32\DriverStore\FileRepository -Recurse | 
    Measure-Object -Property Length -Sum).Sum / 1GB
```

## Script Usage

```powershell
# Preview mode (no changes)
.\DriverCleanup_Windows.ps1 -WhatIf

# Full execution with safety checks
.\DriverCleanup_Windows.ps1

# Force execution even if restore point fails
.\DriverCleanup_Windows.ps1 -Force

# Custom log location
.\DriverCleanup_Windows.ps1 -LogPath "C:\Logs\cleanup.log"
```

## Expected Results

| Metric | Expected Improvement |
|--------|----------------------|
| Registry size | 5-15 MB reduction |
| Device Manager clutter | Cleaner device tree |
| DriverStore | Identification of old packages |
| Boot time | Slight improvement (less enumeration) |
| System stability | Should be unchanged or improved |

## Troubleshooting

**If keyboard/mouse stops working:**
1. Use on-screen keyboard to log in
2. Restore from System Restore Point
3. Or: Boot to Safe Mode, reinstall drivers

**If script fails:**
1. Check log file at `$env:TEMP\DriverCleanup_*.log`
2. Verify running as Administrator
3. Check Windows version compatibility (Windows 10/11)

---

*Generated from automated system analysis. Review before execution.*
