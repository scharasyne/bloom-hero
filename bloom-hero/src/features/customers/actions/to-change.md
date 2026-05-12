to find:

1. where is the current getSession? 
    why are there multiple db calls and session checks?

    files: saveCustomerSettings and uploadCustomerPhoto

2. there's a similar one: updateCustomerProfile from the features/customers/actions/updateCustomerProfile - as well as updateCustomerProfile in features/users/actions/updateCustomerProfile

to do: create a session check with one db call that passes it only once