using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceAI.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBasiqUserIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_PlaidConnections_PlaidConnectionId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "PlaidConnections");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_PlaidConnectionId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "PlaidConnectionId",
                table: "Transactions");

            migrationBuilder.AddColumn<string>(
                name: "BasiqUserId",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BasiqUserId",
                table: "Users");

            migrationBuilder.AddColumn<Guid>(
                name: "PlaidConnectionId",
                table: "Transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PlaidConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessToken = table.Column<string>(type: "text", nullable: false),
                    InstitutionName = table.Column<string>(type: "text", nullable: false),
                    ItemId = table.Column<string>(type: "text", nullable: false),
                    LastSynced = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaidConnections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlaidConnections_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_PlaidConnectionId",
                table: "Transactions",
                column: "PlaidConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaidConnections_UserId",
                table: "PlaidConnections",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_PlaidConnections_PlaidConnectionId",
                table: "Transactions",
                column: "PlaidConnectionId",
                principalTable: "PlaidConnections",
                principalColumn: "Id");
        }
    }
}
