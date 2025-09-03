"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MatchUpPage, PoolsPage, MyBetsPage } from "./components/MatchUpPage";
import { Header, BottomNavigation, PageContainer } from "./components/LayoutComponents";
import { MatchUpIcons } from "./components/MatchUpComponents";



// Wallet connection component
const WalletConnection = () => (
  <Wallet className="z-10">
    <ConnectWallet>
      <div className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer">
        Connect Wallet
      </div>
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

// Tab content component
const TabContent = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "home":
      return <MatchUpPage />;
    case "mybets":
      return <MyBetsPage />;
    case "pools":
      return <PoolsPage />;
    case "about":
      return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <span className="text-xl">🎯</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              About <span className="text-yellow-500">Match-Up</span>
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              A decentralized prediction market platform for sports, crypto, and custom events.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 text-center">Our Mission</h2>
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              We provide a transparent, fair, and secure platform for prediction markets, empowering collective intelligence through decentralized technology.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg mx-auto mb-2">
                🏀
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Sports</h3>
              <p className="text-xs text-gray-600">Game outcomes & events</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-lg mx-auto mb-2">
                ₿
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Crypto</h3>
              <p className="text-xs text-gray-600">Price predictions</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-lg mx-auto mb-2">
                ⭐
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Custom</h3>
              <p className="text-xs text-gray-600">Any topic markets</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg mx-auto mb-2">
                🔒
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Secure</h3>
              <p className="text-xs text-gray-600">Blockchain powered</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-yellow-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Create Markets</h3>
                <p className="text-gray-600 text-xs">Set up prediction markets with custom parameters</p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Make Predictions</h3>
                <p className="text-gray-600 text-xs">Place ETH bets on your predictions</p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Win Rewards</h3>
                <p className="text-gray-600 text-xs">Claim winnings from correct predictions</p>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return <MatchUpPage />;
  }
};

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
    { id: "about", icon: "ℹ️", label: "About" }
  ];

  return (
    <div className="flex flex-col h-screen font-sans text-gray-900 bg-white">
      <PageContainer className="flex flex-col h-full" padding="none">
        {/* Fixed Header */}
        <Header
          title="Match-Up"
          rightContent={
            <>
              {saveFrameButton}
              <WalletConnection />
            </>
          }
          className="flex-shrink-0"
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <TabContent activeTab={activeTab} />
          </div>
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNavigation
          items={navigationItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="flex-shrink-0"
        />
      </PageContainer>
    </div>
  );
}
