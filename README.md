# Insecure Guestbook

>NOTE: Not that anyone runs a guestbook application in production in 2024, but if you do, please don't use this code! It's intentionally insecure, meant for educational purposes only, as part of a workshop around what generative AI can do for cybersecurity.

![img](/img/guestbook.png)

This is a simple guestbook application that intentionally includes several security vulnerabilities for demonstration purposes. There are probably more vulnerabilities in it than were purposely put in! In fact there are files in this app that aren't even used! What a (on purpose) mess!

## Known Vulnerabilities

- SQL Injection
- Session Management
- Admin Privilege Escalation
- Forced Browsing

## Security Tests

>NOTE: Not all tests are working yet.

You can run the security tests with the following command:

```bash
$ ./bin/security-tests.sh help
Usage: ./bin/security-tests.sh [test_name]

Available tests:
  login                  Test common logins
  sql_injection          Run SQL Injection Test
  drop_table             Drop messages table with SQL Injection
  xss                    Run Cross-Site Scripting (XSS) Test
  insecure_auth          List all users and get admin password via SQL Injection
  sensitive_data         Run Sensitive Data Exposure Test
  security_misconfig     Run Security Misconfiguration Test
  known_vulnerabilities  Run Known Vulnerabilities Test
  insufficient_logging   Run Insufficient Logging & Monitoring Test
  list_users             List all users in the database
  list_tables_and_entries List all tables and entries in the database
  list_nonexistent_users Test for nonexistent users in the database
  help                   Display this help message

```

## Dockerfile

You can build the Docker image with the following command:

```bash
docker build -t insecure-guestbook .
```

And run it with something like the following command:

```bash
docker run --name insecure-guestbook -p 3002:3001 insecure-guestbook
```

