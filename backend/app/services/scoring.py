def calculate_score(attempts: int, solved: bool) -> int:
    """
    Calculates the score based on the number of attempts.
    These are temporary default placeholder rules.
    1 attempt → 10
    2 attempts → 8
    3 attempts → 6
    4 attempts → 4
    5 attempts → 2
    6 attempts → 1
    Failed     → 0
    """
    if not solved:
        return 0
        
    scoring_map = {
        1: 10,
        2: 8,
        3: 6,
        4: 4,
        5: 2,
        6: 1
    }
    
    return scoring_map.get(attempts, 0)
