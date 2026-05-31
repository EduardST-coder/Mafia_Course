using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoomFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rooms_users_HostId",
                table: "Rooms");

            migrationBuilder.DropIndex(
                name: "IX_Rooms_HostId",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "IsAlive",
                table: "RoomPlayers");

            migrationBuilder.RenameColumn(
                name: "HostId",
                table: "Rooms",
                newName: "OwnerId");

            migrationBuilder.RenameColumn(
                name: "IsReady",
                table: "RoomPlayers",
                newName: "IsOwner");

            migrationBuilder.AddColumn<bool>(
                name: "IsPrivate",
                table: "Rooms",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "Rooms",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPrivate",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "Rooms");

            migrationBuilder.RenameColumn(
                name: "OwnerId",
                table: "Rooms",
                newName: "HostId");

            migrationBuilder.RenameColumn(
                name: "IsOwner",
                table: "RoomPlayers",
                newName: "IsReady");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Rooms",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsAlive",
                table: "RoomPlayers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_HostId",
                table: "Rooms",
                column: "HostId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rooms_users_HostId",
                table: "Rooms",
                column: "HostId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
