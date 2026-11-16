"use client"

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Navbar from "@/components/Navbars/AuthNavbar.js";
import FooterSmall from "@/components/Footers/FooterSmall.js";
import { Plan } from "commons/models/plan";
import { User } from "commons/models/user";
import { Status } from "commons/models/status";
import { ethers } from "ethers";

import { startPayment } from "@/services/Web3Service";
import { getJwt, signOut } from "@/services/AuthService";
import { getUser, payUser } from "@/services/UserService";

export default function Pay() {
  const { push } = useRouter();

  const params = useParams<{ wallet?: string | string[] }>();

  const wallet: string =
    typeof params.wallet === "string"
      ? params.wallet
      : Array.isArray(params.wallet)
        ? params.wallet[0] ?? ""
        : "";

  const [user, setUser] = useState<User>({} as User);
  const [plan, setPlan] = useState<Plan>({
    name: "Gold",
    id: "Gold",
    tokenSymbol: "WETH",
    tokenAddress: "0xB47e6fC9A1c5D3F8b2E4F1A1D3E4F1A1D3E4F1A1",
    price: ethers.parseEther("0.001").toString(),
    maxAutomations: 10
  } as Plan);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setMessage("Loading payment info...");

    const jwt = getJwt();
    if (!wallet || !jwt || jwt.address.toUpperCase() !== wallet.toUpperCase()) {
      localStorage.clear();
      signOut();
      return;
    }

    getUser(jwt.address)
      .then(user => {
        if (user.status === Status.ACTIVE) {
          push("/dashboard");
          return
        }

        if (user.status !== Status.BLOCKED) {
          signOut();
          return;
        }

        setUser(user);
        setMessage("");
      })
      .catch(err => setMessage(err.response ? err.response.data : err.message));
  }, [wallet])

  function btnPayClick(event?: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    setMessage("Please, autoriza our recurring charges (monthly, 1 year authorization). Cancel anytime.");

    startPayment(plan)
      .then(result => {
        setMessage("Payment authorized. Starting the 1st month charge...wait...");
        return payUser();
      })
      .then(result => push("/dashboard"))
      .catch(err => setMessage(err.response ? JSON.stringify(err.response.data) : err.message));

  }

  return (
    <>
      <Navbar transparent />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-blueGray-800 bg-no-repeat bg-full"
            style={{
              backgroundImage: "url('/img/register_bg_2.png')",
            }}
          ></div>

          <div className="container mx-auto px-4 h-full">
            <div className="flex content-center items-center justify-center h-full">
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
                  <div className="rounded-t mb-0 px-6 py-6">
                    <div className="flex content-center items-center justify-center mb-5">
                      <img src="/img/cerberus.png" width={128} />
                    </div>

                    <div className="text-center mb-3">
                      <h6 className="text-blueGray-500 text-sm font-bold">
                        Below is your plan details.
                      </h6>
                    </div>

                    <form>
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          User
                        </label>
                        <div>
                          {user.name}<br />{user.address}
                        </div>
                      </div>
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Plan
                        </label>
                        <select id="planId" value={plan.id} onChange={evt => setPlan({ ...plan, id: evt.target.value })} className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                          <option value={plan.id}>Gold</option>
                        </select>
                      </div>

                      <div className="mt-3">
                        This plan costs <strong>{plan.tokenSymbol}{`${ethers.formatEther(plan.price)}`}/mo.</strong>and gives you full access to our platform and  <strong>{plan.maxAutomations}</strong> automations.
                      </div>

                      <div className="mt-3">
                        Your last payment was: <strong>Never</strong>
                      </div>

                      <div className="text-center mt-6">
                        <button
                          type="button"
                          onClick={btnPayClick}
                          className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-full"
                        >
                          Pay now
                        </button>
                        <div>{message}</div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FooterSmall absolute />
        </section>
      </main>
    </>
  );
}
