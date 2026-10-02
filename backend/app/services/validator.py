from typing import Dict, Any

def validate_submission(parsed_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates a parsed Wordle screenshot result.
    Checks if the grid data matches the extracted attempts and solved status.
    """
    grid = parsed_result.get("grid", [])
    attempts = parsed_result.get("attempts", 0)
    solved = parsed_result.get("solved", False)
    
    # Validation rules
    is_valid = True
    reasons = []
    
    if not grid:
        return {
            "valid": False,
            "confidence": 0.0,
            "message": "No Wordle grid detected."
        }
        
    if attempts != len(grid):
        is_valid = False
        reasons.append(f"Grid has {len(grid)} rows, but attempts is {attempts}.")
        
    if attempts < 1 or attempts > 6:
        is_valid = False
        reasons.append(f"Invalid number of attempts: {attempts}.")
        
    # Check if the last row matches the solved status
    last_row = grid[-1]
    is_last_row_all_green = all(c == "green" for c in last_row)
    
    if solved and not is_last_row_all_green:
        is_valid = False
        reasons.append("Marked as solved, but the last row is not all green.")
        
    if not solved and is_last_row_all_green:
        is_valid = False
        reasons.append("Marked as not solved, but the last row is all green.")
        
    if not solved and attempts != 6:
        is_valid = False
        reasons.append("Marked as not solved, but attempts is not 6.")

    # Calculate confidence based on validation
    confidence = parsed_result.get("confidence", 1.0)
    if not is_valid:
        confidence = 0.5 # Drop confidence if validation fails
        
    message = "Valid submission." if is_valid else " | ".join(reasons)
    
    return {
        "valid": is_valid,
        "confidence": confidence,
        "message": message
    }
