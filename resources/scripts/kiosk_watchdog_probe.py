# Kiosk Watchdog Probe v2.4
import psutil, time, os

def monitor_kiosk_shell():
    print("[+] Scanning process tree for shell breakout...")
    for proc in psutil.process_iter(['pid', 'name']):
        if proc.info['name'] == 'explorer.exe':
            print(f"[!] ALERT: Explorer.exe running in foreground (PID {proc.info['pid']})")
            print("[!] Kiosk lockdown violated! Windows 10 Start Menu accessible.")
            return True
    print("[+] Kiosk application contained.")
    return False

if __name__ == '__main__':
    monitor_kiosk_shell()
