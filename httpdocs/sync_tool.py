import os
import hashlib
import json
import logging
import shutil

def compare_files(file1, file2):
    """Compares two files based on their content using SHA256 hash."""
    try:
        with open(file1, 'rb') as f1, open(file2, 'rb') as f2:
            hash1 = hashlib.sha256(f1.read()).hexdigest()
            hash2 = hashlib.sha256(f2.read()).hexdigest()
            return hash1 == hash2
    except FileNotFoundError:
        return False

def load_config(config_file="sync_config.json"):
    """Loads configuration from a JSON file."""
    try:
        with open(config_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"source_dir": ".", "target_dir": "httpdocs"}

def should_exclude(path):
    """Checks if a path should be excluded from synchronization."""
    return ".git" in path or ".myimunify_id" in path or ".cagefs" in path or ".cl.selector" in path or ".ssh" in path or "sync_tool.log" in path or "sync_config.json" in path or "httpdocs" in path and path != "httpdocs"

def synchronize_directories(source_dir, target_dir, logger):
    """Synchronizes files between source and target directories."""
    for root, _, files in os.walk(source_dir):
        if should_exclude(root):
            continue
        for file in files:
            if should_exclude(file):
                continue
            source_file = os.path.join(root, file)
            relative_path = os.path.relpath(source_file, source_dir)
            target_file = os.path.join(target_dir, relative_path)

            if os.path.exists(target_file):
                if not compare_files(source_file, target_file):
                    logger.info(f"Syncing: {relative_path}")
                    os.makedirs(os.path.dirname(target_file), exist_ok=True)
                    shutil.copy2(source_file, target_file)
                else:
                    logger.debug(f"Skipping identical file: {relative_path}")
            else:
                logger.info(f"Copying new file: {relative_path}")
                os.makedirs(os.path.dirname(target_file), exist_ok=True)
                shutil.copy2(source_file, target_file)

    for root, _, files in os.walk(target_dir):
        if should_exclude(root):
            continue
        for file in files:
            if should_exclude(file):
                continue
            target_file = os.path.join(root, file)
            relative_path = os.path.relpath(target_file, target_dir)
            source_file = os.path.join(source_dir, relative_path)
            if not os.path.exists(source_file) and not should_exclude(source_file):
                logger.info(f"Removing file from target: {relative_path}")
                os.remove(target_file)

def setup_logger():
    """Sets up the logger."""
    logging.basicConfig(filename='sync_tool.log', level=logging.INFO, 
                        format='%(asctime)s - %(levelname)s - %(message)s')
    return logging.getLogger('sync_tool')

if __name__ == "__main__":
    logger = setup_logger()
    config = load_config()
    source_dir = config.get("source_dir", ".")
    target_dir = config.get("target_dir", "httpdocs")

    logger.info("Starting content synchronization...")
    synchronize_directories(source_dir, target_dir, logger)
    logger.info("Content synchronization completed.")
