class Query:

    @staticmethod
    def manifest():
        return f""" 
        SELECT id, name, classification 
        FROM manifest 
        WHERE account_id = %(account_id)s;
        """

    @staticmethod
    def single_manifest():
        return f"""
        SELECT id, name, classification 
        FROM manifest 
        WHERE account_id = %(account_id)s AND id = %(id)s ;
        """

    @staticmethod
    def update_manifest():
        return f"""
        INSERT INTO manifest (account_id, id, name, classification)
        VALUES (%(account_id)s, %(id)s, %(name)s, %(classification)s)
        ON CONFLICT (account_id, id)
        DO UPDATE SET name = EXCLUDED.name, classification = EXCLUDED.classification;
        """

    @staticmethod
    def remove_manifest():
        return f"""
        DELETE FROM manifest 
        WHERE account_id = %(account_id)s AND id = %(id)s; 
        """

    @staticmethod
    def activity():
        return f"""
        SELECT name, status, cpu, created 
        FROM results 
        WHERE account_id = %(account_id)s AND name = %(name)s ;
        """

    @staticmethod
    def add_link():
        return f"""
        INSERT INTO results (account_id, name, status, cpu) 
        VALUES (%(account_id)s, %(name)s, %(status)s, %(cpu)s); 
        """
