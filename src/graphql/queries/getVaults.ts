import { gql } from "@apollo/client";

const GET_VAULTS = gql`
  query GetVaults {
    vault {
      address
      chain_id
      created_at
      id
      updated_at
      user_id
    }
  }
`;

export default GET_VAULTS;
