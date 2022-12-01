import { gql } from "@apollo/client";

const CREATE_VAULT = gql`
  mutation CreateVault($input: vault_insert_input!) {
    insert_vault_one(
      object: $input
      on_conflict: { constraint: vault_address_key, update_columns: [] }
    ) {
      address
      chain_id
      created_at
      id
      updated_at
      user_id
    }
  }
`;

export default CREATE_VAULT;
