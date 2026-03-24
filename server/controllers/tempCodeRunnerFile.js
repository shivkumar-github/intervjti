			success: true,
				message: "Inserted message successfully."
			});

		} catch (err) {
			return res.status(500).json({
				success: false,
				message: "Server error occured while adding the message!"
			});
		}
	}