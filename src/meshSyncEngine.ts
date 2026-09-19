/**
 * ============================================================================
 * MODULE A: Core Local Offline Mesh-Network Synchronization Engine
 * ============================================================================
 * Design Patterns:
 * 1. SINGLETON PATTERN:entralized MeshNetworkManager class controls discovery,
 *    queue memories, and hardware telemetry status singlepointedly.
 * 2. CHAIN OF RESPONSIBILITY PATTERN: Processes packet transfers through chain:
 *    LocalDbCommitter -> MeshAdjacencyValidator -> PeerBroadcastBroadcaster -> StoreAndForwardQueuer
 * ============================================================================
 */

export interface SyncPacket {
  id: string;
  senderId: string;
  payload: string;
  timestamp: number;
  hops: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface NetworkNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'OPERATOR' | 'SCOUT' | 'CITIZEN' | 'GATEWAY';
  status: 'ONLINE' | 'PENDING' | 'OFFLINE';
  battery: number;
  signalStrength: number;
}

// Chain of Responsibility base handler
export abstract class SyncHandler {
  protected nextHandler: SyncHandler | null = null;

  public setNext(handler: SyncHandler): SyncHandler {
    this.nextHandler = handler;
    return handler;
  }

  public handle(packet: SyncPacket, manager: MeshNetworkManager): void {
    if (this.nextHandler) {
      this.nextHandler.handle(packet, manager);
    }
  }
}

/**
 * 1. CHAIN OF RESPONSIBILITY: Local Database Committer
 * Commits the outgoing message payload to the local relational IndexedDB/LocalStorage.
 */
export class LocalDatabaseCommitter extends SyncHandler {
  public override handle(packet: SyncPacket, manager: MeshNetworkManager): void {
    console.log(`[COR Chain 1] LocalDatabaseCommitter saving packet ${packet.id}`);
    
    // Save to simulate IndexedDB persistence
    const savedPackets = JSON.parse(localStorage.getItem('phoenix_local_db') || '[]');
    savedPackets.push({ ...packet, status: 'PENDING' });
    localStorage.setItem('phoenix_local_db', JSON.stringify(savedPackets));

    // Pass down the chain
    super.handle(packet, manager);
  }
}

/**
 * 2. CHAIN OF RESPONSIBILITY: Device Mesh Adjacency Validator
 * Checks if there are active Bluetooth/Wi-Fi Direct peers nearby.
 */
export class MeshAdjacencyValidator extends SyncHandler {
  public override handle(packet: SyncPacket, manager: MeshNetworkManager): void {
    console.log(`[COR Chain 2] MeshAdjacencyValidator validating adjacencies for packet ${packet.id}`);
    const activePeers = manager.getActiveNeighbors();
    
    if (activePeers.length > 0) {
      // Adjacent peers available, pass to broadcaster
      super.handle(packet, manager);
    } else {
      // No peers available, bypass broadcaster and delegate directly to queue manager
      console.log(`[COR Chain 2] No active peers found. Escalating directly to StoreAndForwardQueuer.`);
      manager.storeAndForwardQueuer.handle(packet, manager);
    }
  }
}

/**
 * 3. CHAIN OF RESPONSIBILITY: Local Peer-to-Peer Broadcast Broadcaster
 * Simulates Wi-Fi Direct or BLE broadcasting of packet to neighboring devices.
 */
export class PeerBroadcastBroadcaster extends SyncHandler {
  public override handle(packet: SyncPacket, manager: MeshNetworkManager): void {
    console.log(`[COR Chain 3] PeerBroadcastBroadcaster broadcasting packet ${packet.id} to neighbors`);
    
    const neighbors = manager.getActiveNeighbors();
    neighbors.forEach(n => {
      console.log(` -> Transmitting packet ${packet.id} to neighbor ${n.name} (Signal: ${n.signalStrength}%)`);
    });

    // Mark as successfully sent to neighbors
    packet.status = 'SYNCED';
    packet.hops += 1;
    
    // Forward down to confirm storage status updates
    super.handle(packet, manager);
  }
}

/**
 * 4. CHAIN OF RESPONSIBILITY: Store-and-Forward Memory Queuer
 * Caches the payload locally inside device memory when connections are offline/critical.
 */
export class StoreAndForwardQueuer extends SyncHandler {
  public override handle(packet: SyncPacket, manager: MeshNetworkManager): void {
    if (packet.status !== 'SYNCED') {
      console.log(`[COR Chain 4] StoreAndForwardQueuer storing packet ${packet.id} in persistent memory queue`);
      manager.queuePacket(packet);
    } else {
      console.log(`[COR Chain 4] Packet ${packet.id} already synced. No storage queuing needed.`);
      manager.updateLocalPacketStatus(packet.id, 'SYNCED');
    }
  }
}

/**
 * SINGLETON PATTERN: MeshNetworkManager
 * Guarantees a single point of coordination for offline P2P synchronization operations.
 */
export class MeshNetworkManager {
  private static instance: MeshNetworkManager | null = null;

  public nodes: NetworkNode[] = [];
  public packetQueue: SyncPacket[] = [];
  public isOnlineMode: boolean = false;
  
  // Handlers
  private syncChain: SyncHandler;
  public storeAndForwardQueuer: StoreAndForwardQueuer;

  private listeners: (() => void)[] = [];

  private constructor() {
    this.nodes = this.getDefaultNodes();
    
    // Setup Chain of Responsibility
    const dbCommitter = new LocalDatabaseCommitter();
    const adjValidator = new MeshAdjacencyValidator();
    const broadcaster = new PeerBroadcastBroadcaster();
    this.storeAndForwardQueuer = new StoreAndForwardQueuer();

    dbCommitter.setNext(adjValidator).setNext(broadcaster).setNext(this.storeAndForwardQueuer);
    this.syncChain = dbCommitter;

    // Load queued packets from previous sessions if any
    this.packetQueue = JSON.parse(localStorage.getItem('phoenix_mesh_queue') || '[]');
  }

  public static getInstance(): MeshNetworkManager {
    if (!MeshNetworkManager.instance) {
      MeshNetworkManager.instance = new MeshNetworkManager();
    }
    return MeshNetworkManager.instance;
  }

  public addListener(cb: () => void): void {
    this.listeners.push(cb);
  }

  public notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  public sendPacket(payload: string, sender: string): void {
    const packet: SyncPacket = {
      id: `PKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: sender,
      payload,
      timestamp: Date.now(),
      hops: 0,
      status: 'PENDING'
    };

    // Process using Chain of Responsibility
    this.syncChain.handle(packet, this);
    this.notifyListeners();
  }

  public getActiveNeighbors(): NetworkNode[] {
    return this.nodes.filter(n => n.status === 'ONLINE' && n.id !== 'GATEWAY');
  }

  public queuePacket(packet: SyncPacket): void {
    packet.status = 'PENDING';
    this.packetQueue.push(packet);
    localStorage.setItem('phoenix_mesh_queue', JSON.stringify(this.packetQueue));
    this.notifyListeners();
  }

  public updateLocalPacketStatus(id: string, status: 'SYNCED' | 'FAILED'): void {
    const localDb = JSON.parse(localStorage.getItem('phoenix_local_db') || '[]');
    const item = localDb.find((p: SyncPacket) => p.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem('phoenix_local_db', JSON.stringify(localDb));
    }
  }

  public setConnectionMode(online: boolean): void {
    this.isOnlineMode = online;
    if (online) {
      this.nodes.forEach(n => {
        if (n.status === 'OFFLINE') n.status = 'ONLINE';
      });
      this.flushQueue();
    } else {
      // Simulate network isolation
      this.nodes.forEach(n => {
        if (n.id === 'GATEWAY') n.status = 'OFFLINE';
      });
    }
    this.notifyListeners();
  }

  public flushQueue(): void {
    console.log(`[MeshNetworkManager] Re-established link. Flushing ${this.packetQueue.length} queued packets.`);
    this.packetQueue.forEach(packet => {
      packet.status = 'SYNCED';
      packet.hops += 1;
      this.updateLocalPacketStatus(packet.id, 'SYNCED');
    });
    this.packetQueue = [];
    localStorage.setItem('phoenix_mesh_queue', JSON.stringify([]));
    this.notifyListeners();
  }

  private getDefaultNodes(): NetworkNode[] {
    return [
      { id: 'PHX-00', name: 'Gateway Node', lat: 31.5204, lon: 74.3587, type: 'GATEWAY', status: 'OFFLINE', battery: 100, signalStrength: 100 },
      { id: 'PHX-01', name: 'Operator Alpha', lat: 31.5220, lon: 74.3540, type: 'OPERATOR', status: 'ONLINE', battery: 88, signalStrength: 95 },
      { id: 'PHX-04', name: 'Scout Bravo 4', lat: 31.5160, lon: 74.3640, type: 'SCOUT', status: 'ONLINE', battery: 65, signalStrength: 78 },
      { id: 'PHX-09', name: 'Scout Bravo 9', lat: 31.5250, lon: 74.3620, type: 'SCOUT', status: 'ONLINE', battery: 42, signalStrength: 64 },
      { id: 'PHX-12', name: 'Citizen Hub Sector G', lat: 31.5180, lon: 74.3500, type: 'CITIZEN', status: 'ONLINE', battery: 94, signalStrength: 82 }
    ];
  }
}
