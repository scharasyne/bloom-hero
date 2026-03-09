--this is only for checking triggers / functions
--this one is used to check where the trigger for adding new users to the schema is currently linked

SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

--OR MORE DESCRIPTIVELY:

SELECT 
    trigger_name,
    event_object_schema,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

