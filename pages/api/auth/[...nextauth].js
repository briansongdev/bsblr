import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { MongoClient } from "mongodb";

export default NextAuth({
  //Configure JWT
  session: {
    strategy: "jwt",
  },
  //Specify Provider
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        //Connect to DB
        const client = await MongoClient.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        const acc = await client.db("bsblDB").collection("account");
        //Find user with the email
        const result = await acc.findOne({
          email: credentials.email,
        });
        //Not found - send error res
        if (!result) {
          client.close();
          throw new Error(
            "No user with this email! Register for an account instead."
          );
        }
        //Check hased password with DB password
        const checkPassword = await compare(
          credentials.password,
          result.password
        );
        //Incorrect password - send response
        if (!checkPassword) {
          client.close();
          throw new Error("Invalid password. Please try again.");
        }
        //Else send success response
        client.close();
        return {
          name: result._id.toString(),
        };
      },
    }),
  ],
});
