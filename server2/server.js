/* A textarea to accept a SQL query to retrieve data and
 a SUBMIT button to send that query onto the server via GET ( if we are reading). 
 Then the client displays the response received from the server.  
 The purpose of this text area is to let visitors of your website run SQl statements
 to ready from that table. 
 However they may enter any SQL statements and it is your responsibility to ensure that
 harmful statements such as DELETE, DROP, CREATE or UPDATE cannot be executed. 
 This protection must be enforced on the server side by configuring/programming the 
 database user with restricted privileges — for example, a read-only / SELECT-only role.
This is the only way that if a malicious or accidental SQL command is submitted, 
the database user should not have permission to modify or delete data. */