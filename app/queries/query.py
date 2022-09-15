class Query:

    @staticmethod
    def manifest():
        return f""" SELECT id, name, classification FROM manifest ;"""

    @staticmethod
    def single_manifest():
        return f""" SELECT id, name, classification FROM manifest WHERE id = %(id)s ;"""

    @staticmethod
    def update_manifest():
        return f"""
        INSERT INTO manifest (id, name, classification)
        VALUES (%(id)s, %(name)s, %(classification)s)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, classification = EXCLUDED.classification;
        """

    @staticmethod
    def remove_manifest():
        return f""" DELETE FROM manifest WHERE id = %(id)s; """

    @staticmethod
    def activity():
        return f""" SELECT name, status, cpu, created FROM results WHERE name = %(name)s ;"""

    @staticmethod
    def add_link():
        return f""" INSERT INTO results (name, status, cpu) VALUES (%(name)s, %(status)s, %(cpu)s); """
