from config import config
import psycopg2


def create_tables():
    """ create tables in the PostgreSQL database"""
    commands = (
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            age INTEGER NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE
            )
        """,
        """ 
        CREATE TABLE IF NOT EXISTS data (
            data_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            time TIMESTAMP WITHOUT TIME ZONE,
            data_sequence BIGINT,
            accel_x INTEGER,
            accel_y INTEGER,
            accel_z INTEGER,
            temperature_1 INTEGER,
            temperature_2 INTEGER,
            humidity_1 INTEGER,
            humidity_2 INTEGER,
            temp_pressure INTEGER,
            pressure BIGINT,
            capacitance_1 INTEGER,
            capacitance_2 INTEGER,
            capacitance_3 INTEGER,
            capacitance_4 INTEGER,
            capacitance_5 INTEGER,
            capacitance_6 INTEGER,
            capacitance_7 INTEGER,
            capacitance_8 INTEGER,
            capacitance_9 INTEGER,
            capacitance_10 INTEGER,
            capacitance_11 INTEGER,
            capacitance_12 INTEGER,
            capacitance_13 INTEGER,
            capacitance_14 INTEGER,
            capacitance_15 INTEGER,
            capacitance_16 INTEGER,
            capacitance_17 INTEGER,
            capacitance_18 INTEGER,
            FOREIGN KEY (user_id)
            REFERENCES users (user_id)
            )
        """
    )
    conn = None
    try:
        # read the connection parameters
        params = config()
        # connect to the PostgreSQL server
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        # create table one by one
        for command in commands:
            cur.execute(command)
        # close communication with the PostgreSQL database server
        cur.close()
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()


if __name__ == '__main__':
    create_tables()
