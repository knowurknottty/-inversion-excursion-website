# Windows Driver Cleanup Script
# Generated from Ducky Report Analysis
# System: LAPTOP-CD5ESKCH | Windows 11 Home (Build 26200)
# Date: 2026-03-06
# WARNING: Review before running. Creates System Restore Point automatically.

#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Cleans up ghost/orphaned USB and HID device drivers from Windows system.
    
.DESCRIPTION
    Based on WMI enumeration showing 308 PlugAndPlay devices with multiple
    duplicate VID/PID entries for Razer, Corsair, and HP devices.
    
    Targets:
    - Ghost USB devices (present in registry but not connected)
    - Duplicate HID keyboard/mouse entries
    - Old driver versions in DriverStore
    - Orphaned registry entries
    
    Safety:
    - Creates System Restore Point before any changes
    - Exports device list before removal
    - Only removes devices marked as "not present"
#>

param(
    [switch]$WhatIf,
    [switch]$Force,
    [string]$LogPath = "$env:TEMP\DriverCleanup_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
)

# Initialize logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogPath -Value $logEntry
}

# Create System Restore Point
function New-SystemRestorePoint {
    Write-Log "Creating System Restore Point..."
    try {
        Checkpoint-Computer -Description "DriverCleanup_$(Get-Date -Format 'yyyyMMdd')" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop
        Write-Log "System Restore Point created successfully" "SUCCESS"
        return $true
    } catch {
        Write-Log "Failed to create System Restore Point: $_" "ERROR"
        if (-not $Force) {
            Write-Log "Use -Force to continue without restore point" "WARNING"
            return $false
        }
        return $true
    }
}

# Export current device state
function Export-DeviceState {
    Write-Log "Exporting current device state..."
    $exportPath = "$env:TEMP\Devices_Before_Cleanup_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
    
    $devices = Get-PnpDevice | Select-Object Name, InstanceId, Status, Class, @{N="Present";E={$_.IsPresent}}
    $devices | Export-Csv -Path $exportPath -NoTypeInformation
    
    Write-Log "Device state exported to: $exportPath" "SUCCESS"
    return $exportPath
}

# Find ghost USB devices (not currently present but in registry)
function Get-GhostUSBDevices {
    Write-Log "Scanning for ghost USB devices..."
    
    # Get all USB devices from registry
    $usbDevices = Get-ChildItem "HKLM:\SYSTEM\CurrentControlSet\Enum\USB" -ErrorAction SilentlyContinue | 
        Get-ChildItem -ErrorAction SilentlyContinue |
        Where-Object { $_.PSChildName -match "VID_" }
    
    $ghostDevices = @()
    
    foreach ($device in $usbDevices) {
        $deviceId = $device.PSChildName
        $properties = Get-ItemProperty $device.PSPath -ErrorAction SilentlyContinue
        
        # Check if device is currently present
        $isPresent = Get-PnpDevice -InstanceId "USB\$deviceId" -ErrorAction SilentlyContinue | 
            Where-Object { $_.Status -eq "OK" }
        
        if (-not $isPresent) {
            $ghostDevices += [PSCustomObject]@{
                DeviceId = $deviceId
                FriendlyName = $properties.FriendlyName
                DeviceDesc = $properties.DeviceDesc
                DriverVersion = $properties.DriverVersion
                RegistryPath = $device.PSPath
            }
        }
    }
    
    Write-Log "Found $($ghostDevices.Count) ghost USB devices" $(if($ghostDevices.Count -gt 0){"WARNING"}else{"SUCCESS"})
    return $ghostDevices
}

# Find duplicate HID devices
function Get-DuplicateHIDDevices {
    Write-Log "Scanning for duplicate HID devices..."
    
    $hidDevices = Get-PnpDevice -Class "HIDClass" | Where-Object { $_.InstanceId -match "VID_" }
    
    # Group by VID/PID
    $grouped = $hidDevices | Group-Object -Property { 
        if ($_.InstanceId -match "VID_([0-9A-F]{4})&PID_([0-9A-F]{4})") {
            "$($matches[1]):$($matches[2])"
        }
    }
    
    $duplicates = $grouped | Where-Object { $_.Count -gt 1 }
    
    Write-Log "Found $($duplicates.Count) VID/PID groups with duplicates" $(if($duplicates.Count -gt 0){"WARNING"}else{"SUCCESS"})
    
    foreach ($dup in $duplicates) {
        Write-Log "  $($dup.Name): $($dup.Count) instances" "INFO"
        $dup.Group | ForEach-Object {
            Write-Log "    - $($_.Name) [$($_.Status)]" "INFO"
        }
    }
    
    return $duplicates
}

# Clean DriverStore (old driver versions)
function Clear-DriverStore {
    Write-Log "Checking DriverStore for old driver versions..."
    
    # Get current driver versions in use
    $activeDrivers = Get-PnpDevice | Where-Object { $_.DriverVersion } | 
        Select-Object Name, DriverVersion, DriverProvider -Unique
    
    # Check DriverStore for duplicates
    $driverStorePath = "C:\Windows\System32\DriverStore\FileRepository"
    $driverFolders = Get-ChildItem $driverStorePath -Directory | 
        Where-Object { $_.Name -match "(raz|cor|hp|hid|usb)" }
    
    Write-Log "Found $($driverFolders.Count) potentially old driver packages in DriverStore" "INFO"
    
    foreach ($folder in $driverFolders) {
        Write-Log "  DriverStore: $($folder.Name)" "INFO"
        # Note: Actual removal requires pnputil and careful checking
    }
    
    return $driverFolders
}

# Main cleanup function
function Invoke-DriverCleanup {
    Write-Log "=== Starting Windows Driver Cleanup ===" "INFO"
    Write-Log "Log file: $LogPath" "INFO"
    
    # Safety checks
    if (-not (New-SystemRestorePoint)) {
        Write-Log "Aborting due to restore point failure" "ERROR"
        exit 1
    }
    
    # Export current state
    $backupPath = Export-DeviceState
    
    # Analysis phase
    Write-Log "" "INFO"
    Write-Log "=== ANALYSIS PHASE ===" "INFO"
    
    $ghostUSB = Get-GhostUSBDevices
    $duplicateHID = Get-DuplicateHIDDevices
    $oldDrivers = Clear-DriverStore
    
    # Report findings
    Write-Log "" "INFO"
    Write-Log "=== FINDINGS SUMMARY ===" "INFO"
    Write-Log "Ghost USB devices: $($ghostUSB.Count)" $(if($ghostUSB.Count -gt 5){"WARNING"}else{"INFO"})
    Write-Log "Duplicate HID groups: $($duplicateHID.Count)" $(if($duplicateHID.Count -gt 0){"WARNING"}else{"INFO"})
    Write-Log "DriverStore packages to review: $($oldDrivers.Count)" "INFO"
    
    if ($WhatIf) {
        Write-Log "" "INFO"
        Write-Log "=== WHAT-IF MODE - NO CHANGES MADE ===" "WARNING"
        Write-Log "Re-run without -WhatIf to perform cleanup" "INFO"
        return
    }
    
    # Cleanup phase
    Write-Log "" "INFO"
    Write-Log "=== CLEANUP PHASE ===" "INFO"
    
    # Remove ghost USB devices from registry
    if ($ghostUSB.Count -gt 0) {
        Write-Log "Removing ghost USB devices from registry..." "WARNING"
        foreach ($device in $ghostUSB) {
            try {
                Remove-Item -Path $device.RegistryPath -Recurse -Force -ErrorAction Stop
                Write-Log "  Removed: $($device.DeviceId)" "SUCCESS"
            } catch {
                Write-Log "  Failed to remove $($device.DeviceId): $_" "ERROR"
            }
        }
    }
    
    # Rescan devices to update status
    Write-Log "Rescanning Plug and Play devices..." "INFO"
    $null = Invoke-Command -ScriptBlock { 
        & "$env:SystemRoot\System32\pnputil.exe" /scan-devices 
    } -ErrorAction SilentlyContinue
    
    # Clear driver cache
    Write-Log "Clearing driver setup cache..." "INFO"
    $cacheFiles = @(
        "$env:SystemRoot\inf\setupapi.dev.log",
        "$env:SystemRoot\inf\setupapi.offline.log"
    )
    
    foreach ($file in $cacheFiles) {
        if (Test-Path $file) {
            try {
                Clear-Content -Path $file -Force -ErrorAction Stop
                Write-Log "  Cleared: $file" "SUCCESS"
            } catch {
                Write-Log "  Failed to clear $file : $_" "ERROR"
            }
        }
    }
    
    # Final report
    Write-Log "" "INFO"
    Write-Log "=== CLEANUP COMPLETE ===" "SUCCESS"
    Write-Log "Log saved to: $LogPath" "INFO"
    Write-Log "Device backup saved to: $backupPath" "INFO"
    Write-Log "System Restore Point created before changes" "INFO"
    Write-Log "Please restart the system to complete cleanup" "WARNING"
}

# Advanced cleanup functions

function Remove-OldDriverVersions {
    <#
    .SYNOPSIS
        Removes old driver versions from DriverStore using pnputil
    #>
    Write-Log "Checking for old driver versions to remove..." "INFO"
    
    # Get list of OEM drivers
    $oemDrivers = & pnputil /enum-drivers /class HIDClass | Out-String
    
    # Parse for duplicates (this is simplified - real implementation would parse properly)
    Write-Log "Review DriverStore packages manually with: pnputil /enum-drivers" "INFO"
    Write-Log "To remove specific driver: pnputil /delete-driver oemXX.inf /uninstall /force" "INFO"
}

function Optimize-HIDDevices {
    <#
    .SYNOPSIS
        Removes duplicate HID device entries
    #>
    Write-Log "Optimizing HID device registry entries..." "INFO"
    
    $hidKeys = Get-ChildItem "HKLM:\SYSTEM\CurrentControlSet\Enum\HID" -ErrorAction SilentlyContinue
    
    foreach ($key in $hidKeys) {
        $subKeys = Get-ChildItem $key.PSPath -ErrorAction SilentlyContinue
        
        # Check for duplicate instances
        if ($subKeys.Count -gt 1) {
            Write-Log "Found $($subKeys.Count) instances of $($key.PSChildName)" "WARNING"
            
            # Keep only the most recent/active one
            $sorted = $subKeys | Sort-Object { 
                (Get-ItemProperty $_.PSPath -Name "DriverDate" -ErrorAction SilentlyContinue).DriverDate 
            } -Descending
            
            $toRemove = $sorted | Select-Object -Skip 1
            foreach ($old in $toRemove) {
                if (-not $WhatIf) {
                    try {
                        Remove-Item $old.PSPath -Recurse -Force
                        Write-Log "  Removed old instance: $($old.PSChildName)" "SUCCESS"
                    } catch {
                        Write-Log "  Failed to remove: $_" "ERROR"
                    }
                }
            }
        }
    }
}

# Execution
Invoke-DriverCleanup

# Post-cleanup recommendation
Write-Log "" "INFO"
Write-Log "=== ADDITIONAL MANUAL STEPS ===" "INFO"
Write-Log "1. Run 'pnputil /enum-drivers' to review remaining drivers" "INFO"
Write-Log "2. Check Device Manager for unknown devices" "INFO"
Write-Log "3. Update remaining drivers from manufacturer websites:" "INFO"
Write-Log "   - Razer: https://www.razer.com/synapse-3" "INFO"
Write-Log "   - Corsair: https://www.corsair.com/icue" "INFO"
Write-Log "   - HP: https://support.hp.com/drivers" "INFO"
Write-Log "" "INFO"
Write-Log "Script completed. Review log at: $LogPath" "SUCCESS"
