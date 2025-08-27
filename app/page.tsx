"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MatchUpPage } from "./components/MatchUpPage";
import { Header, BottomNavigation, PageContainer } from "./components/LayoutComponents";
import { MatchUpIcons } from "./components/MatchUpComponents";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const addFrame = useAddFrame();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          Save Frame
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-blue-600">
          <span>✓</span>
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  // Navigation items configuration
  const navigationItems = [
    { id: "home", icon: MatchUpIcons.home, label: "Home" },
    { id: "mybets", icon: MatchUpIcons.dollar, label: "My Bets" },
    { id: "pools", icon: MatchUpIcons.search, label: "Pools" },
    { id: "profile", icon: MatchUpIcons.profile, label: "Profile" }
  ];

  // Wallet connection component
  const WalletConnection = () => (
    <Wallet className="z-10">
      <ConnectWallet>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Connect Wallet
        </button>
      </ConnectWallet>
      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );

  // Tab content components
  const TabContent = () => {
    switch (activeTab) {
      case "home":
        return <MatchUpPage setActiveTab={setActiveTab} />;
      case "mybets":
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">My Bets</h2>
            <p className="text-gray-600">No active bets yet</p>
          </div>
        );
      case "pools":
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Pools</h2>
            <p className="text-gray-600">Explore prediction pools</p>
          </div>
        );
      case "profile":
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600">Manage your account</p>
          </div>
        );
      default:
        return <MatchUpPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white">
      <PageContainer className="flex flex-col min-h-screen">
        <Header
          title="Match-Up"
          rightContent={
            <>
              {saveFrameButton}
              <WalletConnection />
            </>
          }
        />

        <main className="flex-1">
          <TabContent />
        </main>

        <BottomNavigation
          items={navigationItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </PageContainer>
    </div>
  );
}
