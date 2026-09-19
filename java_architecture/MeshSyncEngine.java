package java_architecture;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * PHOENIX GRID - MESH SYNC ENGINE (JAVA ARCHITECTURE)
 * Contains 7 Integrated Design Patterns Exactly from the University Syllabus.
 * 1. Singleton (Lab 2)
 * 2. Factory (Lab 3)
 * 3. Builder (Lab 4)
 * 4. Adapter & Bridge (Lab 5)
 * 5. Composite (Lab 6)
 * 6. Chain of Responsibility (Lab 7)
 */
public class MeshSyncEngine {

    // =========================================================================
    // PATTERN 1: BUILDER PATTERN (Lab 4)
    // Purpose: Safely constructs complex SyncPacket objects.
    // =========================================================================
    static class SyncPacket {
        private String id;
        private String type; // e.g., "SOS", "STATUS"
        private String payload;
        private String senderId;
        private String status;

        private SyncPacket(Builder builder) {
            this.id = builder.id != null ? builder.id : "PKT-" + UUID.randomUUID().toString().substring(0, 5);
            this.type = builder.type;
            this.payload = builder.payload;
            this.senderId = builder.senderId;
            this.status = "PENDING";
        }

        public String getId() { return id; }
        public String getType() { return type; }
        public String getPayload() { return payload; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public static class Builder {
            private String id;
            private String type;
            private String payload;
            private String senderId;

            public Builder setType(String type) { this.type = type; return this; }
            public Builder setPayload(String payload) { this.payload = payload; return this; }
            public Builder setSenderId(String senderId) { this.senderId = senderId; return this; }

            public SyncPacket build() {
                if (type == null || payload == null) throw new IllegalStateException("Type & Payload required");
                return new SyncPacket(this);
            }
        }
    }

    // =========================================================================
    // PATTERN 2: FACTORY DESIGN PATTERN (Lab 3)
    // Purpose: Creates specific configurations of packets without exposing logic.
    // =========================================================================
    static class PacketFactory {
        public static SyncPacket createSosPacket(String senderId, String emergencyDetails) {
            return new SyncPacket.Builder()
                    .setType("SOS_CRITICAL")
                    .setPayload(emergencyDetails)
                    .setSenderId(senderId)
                    .build();
        }

        public static SyncPacket createStatusPacket(String senderId, String locationInfo) {
            return new SyncPacket.Builder()
                    .setType("ROUTINE_STATUS")
                    .setPayload(locationInfo)
                    .setSenderId(senderId)
                    .build();
        }
    }

    // =========================================================================
    // PATTERN 3: COMPOSITE DESIGN PATTERN (Lab 6)
    // Purpose: Treats individual network nodes and clusters of nodes uniformly.
    // =========================================================================
    interface NodeComponent {
        void receiveTransmission(SyncPacket packet);
    }

    // Leaf
    static class SingleDeviceNode implements NodeComponent {
        private String deviceName;
        public SingleDeviceNode(String name) { this.deviceName = name; }

        @Override
        public void receiveTransmission(SyncPacket packet) {
            System.out.println("[COMPOSITE - LEAF] Device " + deviceName + " received packet: " + packet.getId());
        }
    }

    // Composite
    static class NodeCluster implements NodeComponent {
        private String clusterName;
        private List<NodeComponent> children = new ArrayList<>();

        public NodeCluster(String name) { this.clusterName = name; }
        public void add(NodeComponent component) { children.add(component); }

        @Override
        public void receiveTransmission(SyncPacket packet) {
            System.out.println("[COMPOSITE - ROOT] Broadcasting to cluster: " + clusterName);
            for (NodeComponent child : children) {
                child.receiveTransmission(packet);
            }
        }
    }

    // =========================================================================
    // PATTERN 4: BRIDGE PATTERN (Lab 5)
    // Purpose: Decouples the Abstraction (MessageSender) from Implementation (Protocol).
    // =========================================================================
    // Implementor
    interface NetworkProtocol {
        void transmit(SyncPacket packet, NodeComponent target);
    }

    // Concrete Implementor 1
    static class BluetoothProtocol implements NetworkProtocol {
        @Override
        public void transmit(SyncPacket packet, NodeComponent target) {
            System.out.println("[BRIDGE] Using Bluetooth LE Protocol...");
            target.receiveTransmission(packet);
        }
    }

    // Concrete Implementor 2
    static class WifiDirectProtocol implements NetworkProtocol {
        @Override
        public void transmit(SyncPacket packet, NodeComponent target) {
            System.out.println("[BRIDGE] Using Wi-Fi Direct High-Speed Protocol...");
            target.receiveTransmission(packet);
        }
    }

    // Abstraction
    static abstract class MessageSender {
        protected NetworkProtocol protocol;
        protected MessageSender(NetworkProtocol protocol) { this.protocol = protocol; }
        public abstract void send(SyncPacket packet, NodeComponent target);
    }

    // Refined Abstraction
    static class EmergencyMessageSender extends MessageSender {
        public EmergencyMessageSender(NetworkProtocol protocol) { super(protocol); }
        
        @Override
        public void send(SyncPacket packet, NodeComponent target) {
            System.out.println("[BRIDGE] Initiating Emergency Broadcast Sequence...");
            protocol.transmit(packet, target);
            packet.setStatus("TRANSMITTED");
        }
    }

    // =========================================================================
    // PATTERN 5: ADAPTER PATTERN (Lab 5)
    // Purpose: Translates the internal JSON/Object packet format to an SQL Database format.
    // =========================================================================
    interface SqlDatabase {
        void insertRecord(String query);
    }

    static class SqlServer implements SqlDatabase {
        @Override
        public void insertRecord(String query) {
            System.out.println("[ADAPTER] Executing SQL Query on Server: " + query);
        }
    }

    static class PacketToSqlAdapter {
        private SqlDatabase database;

        public PacketToSqlAdapter(SqlDatabase database) {
            this.database = database;
        }

        public void persistPacket(SyncPacket packet) {
            // Adapting the internal SyncPacket object into an external SQL String
            String sqlQuery = String.format("INSERT INTO SosRequests (Id, Type, Payload) VALUES ('%s', '%s', '%s')", 
                packet.getId(), packet.getType(), packet.getPayload());
            database.insertRecord(sqlQuery);
        }
    }

    // =========================================================================
    // PATTERN 6: CHAIN OF RESPONSIBILITY PATTERN (Lab 7)
    // Purpose: Processes outgoing packets through a sequential pipeline.
    // =========================================================================
    static abstract class SyncHandler {
        protected SyncHandler nextHandler;

        public SyncHandler setNext(SyncHandler handler) {
            this.nextHandler = handler;
            return handler;
        }

        public void handle(SyncPacket packet) {
            if (this.nextHandler != null) {
                this.nextHandler.handle(packet);
            }
        }
    }

    static class FormatValidatorHandler extends SyncHandler {
        @Override
        public void handle(SyncPacket packet) {
            System.out.println("[CHAIN 1] FormatValidator: Checking packet integrity...");
            super.handle(packet);
        }
    }

    static class DatabasePersistenceHandler extends SyncHandler {
        private PacketToSqlAdapter adapter = new PacketToSqlAdapter(new SqlServer());

        @Override
        public void handle(SyncPacket packet) {
            System.out.println("[CHAIN 2] DatabasePersistence: Passing to Adapter...");
            adapter.persistPacket(packet); // Uses Adapter Pattern here!
            super.handle(packet);
        }
    }

    static class MeshBroadcastHandler extends SyncHandler {
        private NodeComponent meshNetwork; // Uses Composite Pattern here!
        private MessageSender sender;      // Uses Bridge Pattern here!

        public MeshBroadcastHandler(NodeComponent network, MessageSender sender) {
            this.meshNetwork = network;
            this.sender = sender;
        }

        @Override
        public void handle(SyncPacket packet) {
            System.out.println("[CHAIN 3] Broadcaster: Sending through Mesh Engine...");
            sender.send(packet, meshNetwork);
            super.handle(packet);
        }
    }

    // =========================================================================
    // PATTERN 7: SINGLETON DESIGN PATTERN (Lab 2)
    // Purpose: Ensures only one central Mesh Coordinator exists system-wide.
    // =========================================================================
    public static class MeshNetworkManager {
        private static volatile MeshNetworkManager instance;
        private SyncHandler syncChain;

        private MeshNetworkManager() {
            // Setup Composite Network
            NodeCluster centralSector = new NodeCluster("Sector Alpha");
            centralSector.add(new SingleDeviceNode("Citizen-Phone-1"));
            centralSector.add(new SingleDeviceNode("Ambulance-Tablet-4"));

            // Setup Bridge Sender
            MessageSender wifiSender = new EmergencyMessageSender(new WifiDirectProtocol());

            // Assemble Chain of Responsibility
            SyncHandler validator = new FormatValidatorHandler();
            SyncHandler dbPersist = new DatabasePersistenceHandler();
            SyncHandler broadcaster = new MeshBroadcastHandler(centralSector, wifiSender);

            validator.setNext(dbPersist).setNext(broadcaster);
            this.syncChain = validator;
        }

        public static MeshNetworkManager getInstance() {
            if (instance == null) {
                synchronized (MeshNetworkManager.class) {
                    if (instance == null) {
                        instance = new MeshNetworkManager();
                    }
                }
            }
            return instance;
        }

        public void processEmergencyEvent(String senderId, String payload) {
            // Uses Factory Pattern here!
            SyncPacket packet = PacketFactory.createSosPacket(senderId, payload);
            System.out.println("\n--- INITIATING SYSTEM CHAIN FOR " + packet.getId() + " ---");
            syncChain.handle(packet);
        }
    }

    // =========================================================================
    // DEMONSTRATION SCRIPT
    // =========================================================================
    public static void main(String[] args) {
        System.out.println("PHOENIX GRID - UNIVERSITY VIVA DEMO");
        
        // 1. Fetch Singleton Manager
        MeshNetworkManager manager = MeshNetworkManager.getInstance();

        // 2. Trigger an Emergency Event
        // This single call will demonstrate ALL 7 patterns working together natively.
        manager.processEmergencyEvent("Admin-X", "Building Collapse at Main Square");
    }
}
